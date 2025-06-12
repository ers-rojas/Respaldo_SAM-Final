<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Config;

class PromocionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;
    public $contenido;
    public $asuntoPersonalizado;
    public $smtpConfig;

    public function __construct($data, $contenido, $asuntoPersonalizado, array $smtpConfig)
    {
        $this->data                = $data;
        $this->contenido           = $contenido;
        $this->asuntoPersonalizado = $asuntoPersonalizado;
        $this->smtpConfig          = $smtpConfig;
    }

    public function build()
    {
        /* -----------------------------------------------------------------
         * 1️⃣  Refuerzo: convertir cualquier ruta relativa  o con el dominio
         *     antiguo  en una URL absoluta basada en APP_URL.
         * -----------------------------------------------------------------*/
        $base = rtrim(config('app.url'), '/');   // http://3.223.16.226

        // a) rutas relativas  storage/...  o  /storage/...
        $this->contenido = preg_replace(
            '#src=["\'](/?storage/)#i',
            'src="'.$base.'/storage/',
            $this->contenido
        );

        // b) URLs absolutas con el dominio viejo
        $this->contenido = str_replace(
            'http://sam-backend-produccion.test',
            $base,
            $this->contenido
        );

        /* -----------------------------------------------------------------
         * 2️⃣  Reconfigurar dinámicamente el mailer con los datos SMTP
         * -----------------------------------------------------------------*/
        app()->forgetInstance('mail.manager');
        app()->forgetInstance('mailer');

        Config::set('mail.mailers.smtp', [
            'transport'  => 'smtp',
            'host'       => $this->smtpConfig['host'],
            'port'       => $this->smtpConfig['port'],
            'encryption' => $this->smtpConfig['encryption'],
            'username'   => $this->smtpConfig['username'],
            'password'   => $this->smtpConfig['password'],
        ]);

        Config::set('mail.from.address', $this->smtpConfig['from']);
        Config::set('mail.from.name',    $this->smtpConfig['name']);

        /* -----------------------------------------------------------------
         * 3️⃣  Construir y devolver el mensaje
         * -----------------------------------------------------------------*/
        return $this->subject($this->asuntoPersonalizado)
                    ->markdown('MailPromotion.promotionMail')
                    ->with([
                        'data'      => $this->data,
                        'contenido' => $this->contenido,
                    ]);
    }
}