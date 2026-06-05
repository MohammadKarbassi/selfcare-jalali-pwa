<?php

require_once INCLUDE_DIR . 'class.plugin.php';
require_once 'config.php';

class KavenegarPlugin extends Plugin {

    var $config_class = 'KavenegarPluginConfig';

    function bootstrap() {
        // پیامک هنگام ثبت تیکت جدید
        Signal::connect('ticket.created', array($this, 'onTicketCreated'));

        // پیامک هنگام پاسخ agent
        Signal::connect('threadentry.created', array($this, 'onThreadEntryCreated'));
    }

    function onTicketCreated($ticket) {
        if (!($phone = $this->extractPhone($ticket))) return;

        $tpl = $this->getConfig()->get('ticket_msg')
            ?: 'تیکت پشتیبانی شما با شماره TK-{number} در خانومی ثبت شد.';
        $msg = str_replace('{number}', $ticket->getNumber(), $tpl);

        $this->sendSms($phone, $msg);
    }

    function onThreadEntryCreated($entry) {
        // فقط پاسخ‌های staff (نوع R = Reply)
        if (!($entry instanceof StaffReply)) return;

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

    // شماره موبایل را از ایمیل به فرمت 09XXXXXXXXX@gmail.com استخراج می‌کند
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

        $ctx = stream_context_create(array('http' => array(
            'method'  => 'POST',
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query($params),
            'timeout' => 10,
        )));

        @file_get_contents($url, false, $ctx);
    }
}
