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

// export const sendEmails = (
//   to,
//   subject,
//   content,
//   attachments,
//   replyTo,
//   next
// ) => {
//   try {
//     const htmlTemplate = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             margin: 0;
//             padding: 0;
//             background-color: rgba(242, 242, 242, 1) !important;
//           }
//           .email-container {
//             max-width: 600px;
//             margin: 20px auto;
//             background-color: #ffffff;
//             border-radius: 8px;
//             overflow: hidden;
//             box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
//           }
//           .email-header {
//             background: rgb(255,255,255);
//             background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(186,187,188,1) 100%);
//             color: black;
//             padding: 20px;
//             text-align: center;
//           }
//           .email-header img {
//             width: 50px;
//             height: auto;
//             display: block;
//             margin: 0 auto;
//           }
//           .email-header h1 {
//             margin: 10px 0 0;
//             font-size: 22px;
//             font-weight: bold;
//           }
//           .email-body {
//             padding: 20px;
//             color: black !important;
//             line-height: 1.6;
//           }
//           .email-body p {
//             margin: 0 0 15px;
//           }
//           .email-footer {
//             background-color: #f4f4f4;
//             text-align: center;
//             padding: 10px;
//             font-size: 12px;
//             color: #777777;
//           }
//             .support{
//             color: black;
//             }
//             .code{
//             font-weight: bold;
//             }
//           .btn {
//             display: inline-block;
//             background: rgb(186,187,188);
//             background: linear-gradient(90deg, rgba(186,187,188,1) 0%, rgba(255,255,255,1) 81%);
//             color: black !important;
//             text-decoration: none;
//             padding: 10px 20px;
//             border-radius: 25px;
//             font-weight: bold;
//             transition: background 0.6s ease, color 0.6s ease;
//           }
//           .btn:hover {
//             background: rgb(255,255,255);
//             background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(186,187,188,1) 100%);
//             color: black;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="email-header">
//           <img src="https://res.cloudinary.com/dceiifram/image/upload/v1741280226/gecaLogo_mtzbis.png" alt="GECA Logo">
//             <h1>Global Ecommerce Alliance</h1>
//           </div>
//           <div class="email-body">
//             <p>Dear User,</p>
//             <p class="code">${content}</p>
//             <p class="support">If you have any questions, please contact us at <a href="mailto:support@gecalliance.com">support@gecalliance.com</a>.</p>
//             <p>
//               <a href="https://gecalliance.org" class="btn">Visit Our Website</a>
//             </p>
//           </div>
//           <div class="email-footer">
//             <p>&copy; ${new Date().getFullYear()} Global Ecommerce Alliance. All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//     const message = {
//       from: {
//         name: process.env.MAIL_FROM_NAME,
//         address: process.env.MAIL_USERNAME,
//       },
//       to: to,
//       subject: subject,
//       html: htmlTemplate,
//       attachments,
//       replyTo,
//     };
//     transporter.sendMail(message, next);
//     console.log("email sent");
//   } catch (error) {
//     console.error(error);
//   }
// };

export const sendEmails = (
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
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5 !important;
      color: #333333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }
    .email-header {
      position: relative;
      height: 100px;
      overflow: hidden;
    }
    .header-content {
      position: relative;
      z-index: 2;
      display: flex;
      padding: 24px 6px;
      align-items: center;
    }
    .logo-container {
      background-color: white;
      width: 180px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
    }
    .email-header img {
      width: 180px;
      height: 40px;
    }
    .header-text {
      color: black;
    }
    .header-text h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
    .header-text p {
      margin: 5px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .email-body {
      padding: 2px 2px;
      color: #444444;
      line-height: 1.6;
    }
    .message-container {
      position: relative;
      margin-bottom: 12px;
    }
    .message {
      padding: 24px;
      background-color: #f8fbfd;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(23, 110, 138, 0.08);
      position: relative;
      z-index: 1;
    }
    .message::before {
      content: "";
      position: absolute;
      top: 12px;
      left: 12px;
      width: 100%;
      height: 100%;
      background-color: rgba(23, 110, 138, 0.04);
      border-radius: 8px;
      z-index: -1;
    }
    .message p {
      margin: 0;
      font-size: 15px;
    }
    .btn {
      position: relative;
      display: inline-block;
      background: linear-gradient(135deg, #176E8A 0%, #002539 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 30px;
      font-weight: 500;
      font-size: 15px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(23, 110, 138, 0.3);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(23, 110, 138, 0.4);
    }
    .divider {
      height: 12px;
      position: relative;
      overflow: hidden;
    }
    .divider::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(to right, #002539, #176E8A, #002539);
    }
    .email-footer {
      background-color: #f8fbfd;
      padding: 2px 24px;
      text-align: center;
      position: relative;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin: 0 8px;
      background: transparent;
      border-radius: 50%;
      color: white;
      text-decoration: none;
      font-size: 16px;
      transition: transform 0.3s ease;
    }
    .social-link:hover {
      transform: scale(1.1);
    }
    .footer-info {
      color: #002539;
      font-size: 14px;
      margin: 8px 0;
    }
    .copyright {
      color: #667788;
      font-size: 12px;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="header-bg"></div>
      <div class="header-overlay"></div>
      <div class="header-content">
        <div class="logo-container">
          <img src="https://res.cloudinary.com/dceiifram/image/upload/v1750178918/gecaLogo2_sqsdpb.png" alt="GECA Logo">
        </div>
        <div class="header-text">
          <h1>Global Ecommerce Alliance</h1>
          <p>Connecting eCommerce Worldwide</p>
        </div>
      </div>
    </div>
    
    <div class="email-body">
      
      <div class="message-container">
        <div class="message">
          <p>${content.message}</p>
        </div>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="email-footer">
      <div class="social-links">
        <a href="https://www.linkedin.com/company/globalecommercealliance/" class="social-link" title="LinkedIn">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/500px-LinkedIn_logo_initials.png" alt="LinkedIn" width="26" height="26">
        </a>
        <a href="https://www.facebook.com/globalecommercealliance/" class="social-link" title="Facebook">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png" alt="Facebook" width="26" height="26">
        </a>
        <a href="https://www.instagram.com/globalecommercealliance/" class="social-link" title="Instagram">
          <img src="https://dreamfoundry.org/wp-content/uploads/2018/12/instagram-logo-png-transparent-background.png" alt="Instagram" width="26" height="26">
        </a>
        <a href="https://www.threads.net/@globalecommercealliance/" class="social-link" title="Threads">
          <img src="https://static.vecteezy.com/system/resources/previews/035/153/631/non_2x/illustration-of-threads-logo-free-png.png" alt="Threads" width="26" height="26">
        </a>
      </div>
      <p class="copyright">&copy; ${new Date().getFullYear()} Global Ecommerce Alliance. All rights reserved.</p>
    </div>
  </div>
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
