<?php

require_once INCLUDE_DIR . 'class.plugin.php';

class KavenegarPluginConfig extends PluginConfig {

    function getOptions() {
        return array(
            'api_key' => new TextboxField(array(
                'label'         => 'کلید API کاوه‌نگار',
                'hint'          => 'کلید API را از پنل کاوه‌نگار دریافت کنید',
                'configuration' => array('size' => 64, 'length' => 128),
                'required'      => true,
            )),
            'sender' => new TextboxField(array(
                'label'         => 'شماره فرستنده (اختیاری)',
                'hint'          => 'خط اختصاصی، در صورت نداشتن خالی بگذارید',
                'configuration' => array('size' => 20, 'length' => 20),
            )),
            'ticket_msg' => new TextareaField(array(
                'label'         => 'متن پیامک ثبت تیکت',
                'hint'          => '{number} = شماره تیکت',
                'default'       => 'تیکت پشتیبانی شما با شماره TK-{number} در خانومی ثبت شد.',
                'configuration' => array('rows' => 3, 'cols' => 60),
            )),
            'reply_msg' => new TextareaField(array(
                'label'         => 'متن پیامک پاسخ پشتیبانی',
                'hint'          => '{number} = شماره تیکت',
                'default'       => 'پاسخ جدیدی برای تیکت TK-{number} شما در خانومی ثبت شد.',
                'configuration' => array('rows' => 3, 'cols' => 60),
            )),
        );
    }
}
