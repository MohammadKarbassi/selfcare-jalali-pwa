<?php

require_once INCLUDE_DIR . 'class.plugin.php';
require_once dirname(__FILE__) . '/config.php';

class KavenegarPlugin extends Plugin {

    var $config_class = 'KavenegarPluginConfig';

    function bootstrap() {
        Signal::connect('ticket.created', array($this, 'onTicketCreated'));
        // osTicket 1.17 uses 'threadentry.added'
        Signal::connect('threadentry.added', array($this, 'onThreadEntryAdded'));
    }

    function onTicketCreated($ticket) {
        if (!($phone = $this->extractPhone($ticket))) return;

        $tpl = $this->getConfig()->get('ticket_msg')
            ?: 'تیکت پشتیبانی شما با شماره TK-{number} در خانومی ثبت شد.';
        $msg = str_replace('{number}', $ticket->getNumber(), $tpl);

        $this->sendSms($phone, $msg);
    }

    function onThreadEntryAdded($entry) {
        // type R = Response (staff reply), M = Message (client)
        if ($entry->get('type') !== 'R') return;

        $thread = $entry->getThread();
        if (!$thread) return;

        $ticket = $thread->getObject();
        if (!($ticket instanceof Ticket)) return;

        if (!($phone = $this->extractPhone($ticket))) return;

        $tpl = $this->getConfig()->get('reply_msg')
            ?: 'پاسخ جدیدی برای تیکت TK-{number} شما در خانومی ثبت شد.';
        $msg = str_replace('{number}', $ticket->getNumber(), $tpl);

        $this->sendSms($phone, $msg);
    }

    private function extractPhone($ticket) {
        try {
            $email = $ticket->getEmail();
        } catch (Exception $e) {
            return null;
        }
        if (preg_match('/^(09\d{9})@/i', $email, $m)) {
            return $m[1];
        }
        return null;
    }

    private function sendSms($receptor, $message) {
        $apiKey = trim($this->getConfig()->get('api_key') ?? '');
        if (!$apiKey) return;

        $sender = trim($this->getConfig()->get('sender') ?? '');
        $params = array('receptor' => $receptor, 'message' => $message);
        if ($sender) $params['sender'] = $sender;

        $url = "https://api.kavenegar.com/v1/{$apiKey}/sms/send.json";

        // use curl (more reliable than file_get_contents for HTTPS)
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_exec($ch);
            curl_close($ch);
        } else {
            $ctx = stream_context_create(array('http' => array(
                'method'  => 'POST',
                'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query($params),
                'timeout' => 10,
            )));
            @file_get_contents($url, false, $ctx);
        }
    }
}
