package com.example.back_end.Infra.email;

import jakarta.mail.internet.MimeMessage;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.back_end.Comodato.Comodato;
import com.example.back_end.PatrimonioEspecifico.EstadoEnum;
import com.example.back_end.PatrimonioEspecifico.PatrimonioEspecifico;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:sistema@patrimonio.com}")
    private String remetente;

    @Value("${api.frontend.url}")
    private String frontendUrl;

    @Value("${api.backend.url}")
    private String backendUrl;

    private static final String COR_BOTAO = "#212D6B"; 

    private static final String COR_HEADER = "#3A4474";
    
    private static final String COR_VALIDACAO = "#4ef312";
    
    // link da logo
    // Ex: "https://i.imgur.com/SuaLogo.png"
    private static final String LOGO_URL = "";

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmailConvite(String destinatario, String token) {
        String assunto = "Bem-vindo ao GIAP";
        String link = frontendUrl + "/forgot-password-reset?token=" + token;

        String conteudoHtml = String.format("""
            <h2 style="color: %s; margin-top: 0; font-size: 20px; text-align: center; font-weight: 700; font-family: 'Segoe UI', sans-serif;">
                Bem-vindo ao GIAP
            </h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center;">
                Sua conta foi criada com sucesso na plataforma de Gestão de Ativos.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 30px;">
                Para começar, clique no botão abaixo para definir sua senha de acesso.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="%s" style="background-color: %s; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(33, 45, 107, 0.2);">
                    DEFINIR MINHA SENHA
                </a>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px;">
                Link seguro válido por 48 horas.
            </p>
        """, COR_HEADER, link, COR_BOTAO);

        enviarEmailHtml(destinatario, assunto, conteudoHtml);
    }

    public void enviarEmailRecuperacao(String destinatario, String token) {
        String assunto = "Redefinição de Senha - GIAP";
        String link = frontendUrl + "/forgot-password-reset?token=" + token;

        String conteudoHtml = String.format("""
            <h2 style="color: %s; margin-top: 0; font-size: 20px; text-align: center; font-weight: 700; font-family: 'Segoe UI', sans-serif;">
                Redefinir Senha
            </h2>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center;">
                Recebemos uma solicitação para alterar sua senha.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center; margin-bottom: 10px;">
                Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="%s" style="background-color: %s; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(33, 45, 107, 0.2);">
                    ALTERAR SENHA
                </a>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                Se você não solicitou, ignore este e-mail.
            </p>
        """, COR_HEADER, link, COR_BOTAO);

        enviarEmailHtml(destinatario, assunto, conteudoHtml);
    }

    private void enviarEmailHtml(String destinatario, String assunto, String conteudoEspecifico) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String headerContent = (LOGO_URL != null && !LOGO_URL.isEmpty()) 
                ? "<img src='" + LOGO_URL + "' alt='GIAP' style='max-height: 40px;'>"
                : "<div style='text-align: center;'><h1 style='color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 2px; font-weight: 800; font-family: sans-serif;'>GIAP</h1><p style='color: rgba(255,255,255,0.7); margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 3px;'>Gestão de Ativos</p></div>";

            String templateFinal = String.format("""
                <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 40px 0;">
                    
                    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                        
                        <div style="background-color: %s; padding: 30px 20px; text-align: center;">
                            %s
                        </div>
        
                        <div style="padding: 40px 30px;">
                            %s
                        </div>
                        
                        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2026 GIAP - Todos os direitos reservados.</p>
                        </div>
                    </div>
                </div>
            """, COR_HEADER, headerContent, conteudoEspecifico);

            helper.setFrom(remetente, "GIAP - Segurança");
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(templateFinal, true);

            mailSender.send(message);

        } catch (Exception e) {
            System.out.println("❌ Erro ao enviar email: " + e.getMessage());
        }
    }

    //enviar o termo de comodato
    public void enviarEmailComodato(String destinatario, String token, Comodato comodato) {
        String assunto = "Assinatura do Termo de Comodato - GIAP";
        String link = frontendUrl + "/comodato/assinar-termo?token=" + token;

        // Montando a lista de equipamentos
        StringBuilder equipamentosHtml = new StringBuilder();

        if (comodato.getPatrimonios() != null && !comodato.getPatrimonios().isEmpty()) {

            equipamentosHtml.append("""
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: 'Segoe UI', sans-serif;">
                    <thead>
                        <tr style="background-color: #f3f4f6; text-align: left;">
                            <th style="padding: 10px; border: 1px solid #e5e7eb;">Item</th>
                            <th style="padding: 10px; border: 1px solid #e5e7eb;">Descrição</th>
                            <th style="padding: 10px; border: 1px solid #e5e7eb;">Nº Série / Patrimônio</th>
                        </tr>
                    </thead>
                    <tbody>
            """);

            int index = 1;

            for (PatrimonioEspecifico p : comodato.getPatrimonios()) {

                String descricao = p.getPatrimonioGeral() != null 
                    ? p.getPatrimonioGeral().getDescricao() 
                    : "Sem descrição";

                String patrimonioNumSerie = p.getNumSerie() != null 
                    ? p.getNumSerie() 
                    : "N/A";

                equipamentosHtml.append(String.format("""
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">%d</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">%s</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">%s</td>
                    </tr>
                """, index++, descricao, patrimonioNumSerie));
            }

            equipamentosHtml.append("""
                    </tbody>
                </table>
            """);

        } else {
            equipamentosHtml.append("<p style='color: #4b5563;'>Nenhum equipamento cadastrado.</p>");
        }

        // Montando o HTML completo
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String conteudoHtml = String.format("""
            <h2 style="color: %s; margin-top: 0; font-size: 20px; text-align: center; font-weight: 700; font-family: 'Segoe UI', sans-serif;">
                Termo de Comodato
            </h2>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center;">
                Recebemos sua solicitação para comodar o(s) equipamento(s) abaixo:
            </p>

            %s

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center;">
                <strong>Período do comodato:</strong> %s até %s
            </p>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center;">
                <strong>Titular:</strong> %s
            </p>

            <div style="text-align: center; margin: 35px 0;">
                <a href="%s" style="
                    background-color: #212D6B;
                    color: #ffffff;
                    padding: 14px 32px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    display: inline-block;
                    font-size: 15px;
                    font-family: 'Segoe UI', sans-serif;
                    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
                ">
                    ASSINAR TERMO
                </a>
            </div>

            <p style="font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                Se você não solicitou, ignore este e-mail.
            </p>
        """,
        COR_HEADER,
        equipamentosHtml.toString(),
        comodato.getDataInicio() != null ? comodato.getDataInicio().format(formatter) : "N/A",
        comodato.getDataFimEsperado() != null ? comodato.getDataFimEsperado().format(formatter) : "N/A",
        comodato.getTitular() != null ? comodato.getTitular().getNome() : "N/A",
        link,
        COR_VALIDACAO
        );

        enviarEmailHtml(destinatario, assunto, conteudoHtml);

    }


    public void enviarCopiaTermoAssinado(String destinatario, byte[] pdfBytes, Comodato comodato) {
        String assunto = "Cópia do Termo de Comodato Assinado - GIAP";
        
        String conteudoHtml = String.format("""
            <h2 style="color: %s; text-align: center;">Termo Assinado com Sucesso!</h2>
            <p style="color: #4b5563; font-size: 16px;">
                Olá, <strong>%s</strong>.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
                Confirmamos o recebimento da assinatura do seu termo de comodato. 
                Em anexo, você encontrará a cópia do documento para seus registros.
            </p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">
                    <strong>Documento:</strong> Termo_Comodato_%s.pdf
                </p>
            </div>
        """, 
        COR_HEADER, 
        comodato.getTitular().getNome(), 
        comodato.getUuid().toString().substring(0, 8));

        String nomeArquivo = "Termo_Comodato_" + comodato.getUuid().toString().substring(0, 8) + ".pdf";
        
        enviarEmailComAnexo(destinatario, assunto, conteudoHtml, pdfBytes, nomeArquivo);
    }

    public void enviarEmailNotificacaoSaida(String destinatario, PatrimonioEspecifico p, EstadoEnum estado, byte[] pdfBytes) {
        String assunto = "Notificação de Alteração de Patrimônio - " + estado.toString();
        
        String conteudoHtml = String.format("""
            <h2 style="color: #3A4474; text-align: center;">Atualização de Ativo</h2>
            <p>Informamos que o patrimônio <strong>%s</strong> (S/N: %s) foi registrado com o estado: <strong>%s</strong>.</p>
            <p>O documento oficial gerado pelo sistema segue em anexo a este e-mail para arquivamento e conferência.</p>
            <p style="font-size: 12px; color: #666; margin-top: 20px;">Este é um e-mail automático do GIAP.</p>
        """, 
        p.getPatrimonioGeral().getDescricao(), 
        p.getNumPatrimonio(), 
        estado.toString());

        String nomeArquivo = "Termo_" + estado.toString() + "_" + p.getNumPatrimonio() + ".pdf";
        
        // Reutiliza o método genérico que criamos anteriormente
        enviarEmailComAnexo(destinatario, assunto, conteudoHtml, pdfBytes, nomeArquivo);
    }

    //metodo de apoio
    private void enviarEmailComAnexo(String destinatario, String assunto, String conteudoHtml, byte[] anexo, String nomeArquivo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // O parâmetro 'true' no construtor indica que a mensagem é multipart (suporta anexos)
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // ... lógica do template (mesma que você já usa) ...
            String headerContent = (LOGO_URL != null && !LOGO_URL.isEmpty()) 
                ? "<img src='" + LOGO_URL + "' alt='GIAP' style='max-height: 40px;'>"
                : "<div style='text-align: center;'><h1 style='color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 2px; font-weight: 800; font-family: sans-serif;'>GIAP</h1></div>";

            String templateFinal = String.format("""
                <div style="font-family: sans-serif; background-color: #f1f5f9; padding: 40px 0;">
                    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <div style="background-color: %s; padding: 30px 20px; text-align: center;">
                            %s
                        </div>
                        <div style="padding: 40px 30px;">
                            %s
                        </div>
                    </div>
                </div>
            """, COR_HEADER, headerContent, conteudoHtml);

            helper.setFrom(remetente, "GIAP - Documentação");
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(templateFinal, true);

            // Adiciona o anexo
            if (anexo != null) {
                helper.addAttachment(nomeArquivo, new org.springframework.core.io.ByteArrayResource(anexo));
            }

            mailSender.send(message);

        } catch (Exception e) {
            System.out.println("❌ Erro ao enviar email com anexo: " + e.getMessage());
        }
    }
}