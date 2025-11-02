import { createReadStream } from "fs";
import { createTransport } from "nodemailer";
import emailConfig from "../config/email.js";

const transporter = createTransport(emailConfig);

export const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on("data", (data) => buffers.push(data));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

export const getFileContent = async (filePath) => {
  const fileStream = createReadStream(filePath);
  const buffer = await streamToBuffer(fileStream);
  return buffer.toString();
};

  export const sendMemberEmails = (
    to,
    subject,
    content,
    attachments,
    replyTo,
    next
  ) => {
    try {
      const htmlTemplate = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Business is Now in GeCA's Global Directory</title>
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333333;
      -webkit-font-smoothing: antialiased;
    }
    
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    
    @media screen and (max-width: 600px) {
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      
      .mobile-col {
        display: block !important;
        width: 100% !important;
      }
      
      .mobile-text-center {
        text-align: center !important;
      }
      
      .mobile-margin-bottom {
        margin-bottom: 25px !important;
      }
      
      .mobile-button {
        display: block !important;
        width: 100% !important;
      }
      
      .logo {
        max-width: 180px !important;
        height: auto !important;
      }
      
      .mobile-hide {
        display: none !important;
      }
      
      .mobile-center {
        margin: 0 auto !important;
        text-align: center !important;
      }
      
      .mobile-padding-bottom {
        padding-bottom: 20px !important;
      }
      
      .mobile-font {
        font-size: 16px !important;
        line-height: 24px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <!-- Preheader text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    Your business is now in GeCA's Global Directory - Complete your profile for maximum visibility
  </div>
  
  <!-- Main Table -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border: 0; min-width: 100%; width: 100%; background-color: #f5f5f5;">
    <tr>
      <td align="center" valign="top">
        <!-- Top Bar -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 0; min-width: 100%; width: 100%; background: linear-gradient(to right, #002539, #176E8A);">
          <tr>
            <td align="center" style="padding: 6px 0;">
              <p style="margin: 0; font-size: 13px; color: #ffffff; font-weight: 500;">View this email in your browser</p>
            </td>
          </tr>
        </table>
        
        <!-- Email Container -->
        <table class="container" width="600" cellpadding="0" cellspacing="0" style="border: 0; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                <tr>
                  <td style="padding: 10px 40px; background-color: #002539; border-radius: 0 0 50% 0 / 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                      <tr>
                        <td class="mobile-col" width="50%" style="vertical-align: middle;">
                          <img src="https://res.cloudinary.com/dceiifram/image/upload/v1748978443/Geca_Logo_Redesigning_Final_Logo-02_zvkltn.png" alt="GeCA Logo" width="100" class="logo" style="display: block; border: 0; margin: auto;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background: linear-gradient(135deg, #176E8A, #002539); padding: 30px 40px; text-align: center; border-radius: 0 0 8px 8px;">
                    <h1 style="margin: 0 0 15px; font-size: 32px; line-height: 1.2; color: #ffffff; font-weight: 700;">🌟 You're Now in Our Global Directory!</h1>
                    <p style="margin: 0; font-size: 16px; line-height: 24px; color: rgba(255,255,255,0.9);">Connect with thousands of eCommerce professionals worldwide</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Welcome Section -->
          <tr>
            <td style="padding: 40px 40px 30px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                      <tr>
                        <td width="50" style="vertical-align: top;">
                          <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #002539; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">👋</div>
                        </td>
                        <td style="vertical-align: top;">
                          <h2 style="margin: 0; font-size: 22px; color: #002539; font-weight: 700;">Hello Valued Member,</h2>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f0f7fa; padding: 25px; border-radius: 8px; border-left: 4px solid #176E8A;">
                    <p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333; font-weight: 600;">
                      Exciting news! Your business is now included in GeCA's Global Directory, giving you instant access to thousands of eCommerce professionals around the world.
                    </p>
                    <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">
                      From potential partners to global buyers and service providers, your business is already on their radar.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Call to Action - Complete Profile -->
          <tr>
            <td style="padding: 0 40px 30px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                      <tr>
                        <td width="50" style="vertical-align: top;">
                          <div style="width: 40px; height: 40px; border-radius: 50%; background-color: #176E8A; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">🚀</div>
                        </td>
                        <td style="vertical-align: top;">
                          <h2 style="margin: 0; font-size: 22px; color: #002539; font-weight: 700;">Stand Out with Global Visibility</h2>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${content.message}
                              </table>
            </td>
          </tr>
          
          <!-- Closing Message -->
          <tr>
            <td style="padding: 0 40px 30px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                <tr>
                  <td style="background-color: #f9f9f9; padding: 25px; border-radius: 8px;">
                    <p style="margin: 0 0 15px; font-size: 16px; line-height: 24px; color: #333333;">
                      Best regards,
                    </p>
                    <p style="margin: 0; font-size: 16px; line-height: 24px; color: #002539; font-weight: 600;">
                      The GeCA Team
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #002539; padding: 30px 40px; border-radius: 0 0 8px 8px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                <tr>
                  <td class="mobile-col mobile-text-center mobile-padding-bottom" width="60%" style="vertical-align: top;">
                    <img src="https://res.cloudinary.com/dceiifram/image/upload/v1748978443/Geca_Logo_Redesigning_Final_Logo-02_zvkltn.png" alt="GeCA Logo" width="150" style="display: block; border: 0; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 14px; line-height: 21px; color: rgba(255,255,255,0.7);">
                      Global eCommerce Alliance<br>
                      Connecting businesses worldwide
                    </p>
                  </td>
                  <td class="mobile-col mobile-text-center" width="40%" style="vertical-align: top; text-align: right;">
                    <p style="margin: 0 0 10px; font-size: 16px; color: #ffffff; font-weight: 600;">Stay Connected</p>
                    <table cellpadding="0" cellspacing="0" style="border: 0; display: inline-block;">
                      <tr>
                        <td style="padding-left: 10px;">
                          <a href="https://www.facebook.com/globalecommercealliance/" target="_blank" style="display: inline-block; width: 22px; height: 22px; padding: 5px; background-color: #176E8A; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none; font-weight: bold;">
                            <img src="https://res.cloudinary.com/dceiifram/image/upload/v1745954162/3_xl9yt9.png" alt="Facebook" width="20" height="20" style="display: inline-block; border: 0;">
                          </a>
                        </td>
                        <td style="padding-left: 10px;">
                          <a href="https://www.threads.net/@globalecommercealliance/" target="_blank" style="display: inline-block; width: 22px; height: 22px; padding: 5px; background-color: #176E8A; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none; font-weight: bold;">
                            <img src="https://res.cloudinary.com/dceiifram/image/upload/v1745954162/4_txqyhv.png" alt="Threads" width="20" height="20" style="display: inline-block; border: 0;">
                          </a>
                        </td>
                        <td style="padding-left: 10px;">
                          <a href="https://www.linkedin.com/company/globalecommercealliance/" target="_blank" style="display: inline-block; width: 22px; height: 22px; padding: 5px; background-color: #176E8A; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none; font-weight: bold;">
                            <img src="https://res.cloudinary.com/dceiifram/image/upload/v1745954162/2_z9e3t1.png" alt="LinkedIn" width="20" height="20" style="display: inline-block; border: 0;">
                          </a>
                        </td>
                        <td style="padding-left: 10px;">
                          <a href="https://www.instagram.com/globalecommercealliance/" target="_blank" style="display: inline-block; width: 22px; height: 22px; padding: 5px; background-color: #176E8A; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none; font-weight: bold;">
                            <img src="https://res.cloudinary.com/dceiifram/image/upload/v1745954162/1_zmyvwr.png" alt="Instagram" width="20" height="20" style="display: inline-block; border: 0;">
                          </a>
                        </td>
                        <td style="padding-left: 10px;">
                          <a href="https://www.youtube.com/@gecaexclusive" target="_blank" style="display: inline-block; width: 22px; height: 22px; padding: 5px; background-color: #176E8A; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none; font-weight: bold;">
                            <img src="https://res.cloudinary.com/dceiifram/image/upload/v1748980895/Untitled_design_3_i6kg8m.png" alt="YouTube" width="20" height="20" style="display: inline-block; border: 0;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
                      <tr>
                        <td class="mobile-col mobile-text-center mobile-padding-bottom" style="vertical-align: top; text-align: center;">
                          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5);">
                            © 2025 Global eCommerce Alliance. All rights reserved.
                          </p>
                        </td>
                        <td class="mobile-col mobile-text-center" style="vertical-align: top; text-align: right;">
                          <p style="margin: 0; vertical-align: top; text-align: right;">
                          <!-- <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5);">
                            <p style="margin: 0; font-weight: bold; font-size: 13px; color: white">
                              IS #02
                            </p>
                          </p> -->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Spacer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 0;">
          <tr>
            <td style="height: 40px;"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;
      const message = {
        from: {
          name: process.env.MAIL_FROM_NAME,
          address: process.env.MAIL_USERNAME,
        },
        to: to,
        subject: subject,
        html: htmlTemplate,
        attachments,
        replyTo,
      };
      transporter.sendMail(message, next);
      console.log("email sent");
    } catch (error) {
      console.error(error);
    }
  };
