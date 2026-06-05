<?php

require_once INCLUDE_DIR . 'class.plugin.php';
require_once dirname(__FILE__) . '/config.php';

class KavenegarPlugin extends Plugin {

    var $config_class = 'KavenegarPluginConfig';

    private function log($msg) {
        $line = date('Y-m-d H:i:s') . ' ' . $msg . "\n";
        @file_put_contents('/tmp/kavenegar_debug.log', $line, FILE_APPEND);
    }

    function bootstrap() {
        $this->log('bootstrap called');

        Signal::connect('ticket.created',      array($this, 'onTicketCreated'));
        Signal::connect('ticket.opened',       array($this, 'onTicketCreated'));
        Signal::connect('threadentry.added',   array($this, 'onThreadEntryAdded'));
        Signal::connect('threadentry.created', array($this, 'onThreadEntryAdded'));
        Signal::connect('model.created',       array($this, 'onModelCreated'));
    }

    // fallback: catch all model creations to find the right signal
    function onModelCreated($model) {
        $class = get_class($model);
        $this->log("model.created fired: $class");
    }

    function onTicketCreated($ticket) {
        $this->log('onTicketCreated fired, class=' . get_class($ticket));
        $email = '';
        try { $email = $ticket->getEmail(); } catch (Exception $e) { $email = 'ERROR:'.$e->getMessage(); }
        $this->log('email=' . $email);

        if (!($phone = $this->extractPhone($email))) {
            $this->log('phone not extracted from: ' . $email);
            return;
        }

        $tpl = $this->getConfig()->get('ticket_msg')
            ?: 'تیکت پشتیبانی شما با شماره TK-{number} در خانومی ثبت شد.';
        $msg = str_replace('{number}', $ticket->getNumber(), $tpl);
        $this->log('sending SMS to ' . $phone);
        $result = $this->sendSms($phone, $msg);
        $this->log('SMS result: ' . $result);
    }

    function onThreadEntryAdded($entry) {
        $type = $entry->get('type');
        $this->log('onThreadEntryAdded fired, type=' . $type);
        if ($type !== 'R') return;

        $thread = $entry->getThread();
        if (!$thread) { $this->log('no thread'); return; }

        $ticket = $thread->getObject();
        if (!($ticket instanceof Ticket)) { $this->log('object not Ticket: ' . get_class($ticket)); return; }

        $email = '';
        try { $email = $ticket->getEmail(); } catch (Exception $e) { $email = 'ERROR:' . $e->getMessage(); }
        $this->log('reply email=' . $email);

        if (!($phone = $this->extractPhone($email))) {
            $this->log('phone not extracted from: ' . $email);
            return;
        }

        $tpl = $this->getConfig()->get('reply_msg')
            ?: 'پاسخ جدیدی برای تیکت TK-{number} شما در خانومی ثبت شد.';
        $msg = str_replace('{number}', $ticket->getNumber(), $tpl);
        $this->log('sending reply SMS to ' . $phone);
        $result = $this->sendSms($phone, $msg);
        $this->log('SMS result: ' . $result);
    }

    private function extractPhone($email) {
        if (preg_match('/^(09\d{9})@/i', $email, $m)) {
            return $m[1];
        }
        return null;
    }

    private function sendSms($receptor, $message) {
        $apiKey = trim($this->getConfig()->get('api_key') ?? '');
        if (!$apiKey) { return 'no api key'; }

        $sender = trim($this->getConfig()->get('sender') ?? '');
        $params = array('receptor' => $receptor, 'message' => $message);
        if ($sender) $params['sender'] = $sender;

        $url = "https://api.kavenegar.com/v1/{$apiKey}/sms/send.json";

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        return $err ?: $result;
    }
}
