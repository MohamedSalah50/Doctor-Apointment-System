// utils/email/email-templates.util.ts

export const getAcceptanceEmailTemplate = (data: {
  userName: string;
  jobTitle: string;
  companyName: string;
}) => {
  return {
    subject: `Congratulations! Your application for ${data.jobTitle} has been accepted`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #4CAF50; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 5px 5px 0 0;
          }
          .content { 
            padding: 30px; 
            background-color: #f9f9f9; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background-color: #f0f0f0;
            border-radius: 0 0 5px 5px;
          }
          h1 { margin: 0; }
          p { margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <h2>Dear ${data.userName},</h2>
            <p>
              We are pleased to inform you that your application for the position of 
              <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> 
              has been <strong>accepted</strong>!
            </p>
            <p>
              We were impressed by your qualifications and experience, and we believe 
              you would be a great fit for our team.
            </p>
            <p>
              Our HR team will contact you shortly with the next steps in the hiring process.
            </p>
            <p>
              Thank you for your interest in joining our company. We look forward to 
              working with you!
            </p>
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>${data.companyName} HR Team</strong>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} ${data.companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};

export const getRejectionEmailTemplate = (data: {
  userName: string;
  jobTitle: string;
  companyName: string;
}) => {
  return {
    subject: `Update on your application for ${data.jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #2196F3; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 5px 5px 0 0;
          }
          .content { 
            padding: 30px; 
            background-color: #f9f9f9; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background-color: #f0f0f0;
            border-radius: 0 0 5px 5px;
          }
          h1 { margin: 0; }
          p { margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Update</h1>
          </div>
          <div class="content">
            <h2>Dear ${data.userName},</h2>
            <p>
              Thank you for your interest in the <strong>${data.jobTitle}</strong> 
              position at <strong>${data.companyName}</strong> and for taking the time 
              to apply and interview with us.
            </p>
            <p>
              After careful consideration, we have decided to move forward with other 
              candidates whose qualifications more closely match our current needs.
            </p>
            <p>
              We appreciate the time and effort you invested in your application. 
              We were impressed by your background and encourage you to apply for 
              future openings that match your skills and experience.
            </p>
            <p>
              We wish you the best of luck in your job search and future endeavors.
            </p>
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>${data.companyName} HR Team</strong>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} ${data.companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};
