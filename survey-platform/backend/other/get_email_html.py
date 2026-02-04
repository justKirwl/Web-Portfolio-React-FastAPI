from textwrap import dedent

async def get_share_survey_html(survey_url: str) -> str:
    html = dedent(f'''
        <div style="font-family:Arial, sans-serif; background:linear-gradient(135deg,#f9f9f9,#e3f2fd); 
                    border:2px solid #90caf9; border-radius:12px; padding:24px; max-width:500px; 
                    margin:auto; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color:#1565c0; margin-bottom:16px;">🌟 We Value Your Voice!</h2>
            <p style="color:#333; font-size:16px; line-height:1.5; margin-bottom:20px;">
                Your feedback helps us grow and improve. Take a few minutes to share your thoughts 
                and be part of shaping the future!
            </p>
            <a href="{survey_url}" style="display:inline-block; background:#42a5f5; color:#fff; text-decoration:none; font-size:18px; font-weight:bold; padding:12px 24px; border-radius:8px; transition:background 0.3s ease;">
                Take the Survey 🚀
            </a>
            <p style="color:#555; font-size:14px; margin-top:20px;">
                Thank you for helping us make things better 💙
            </p>
        </div>
    ''')

    return html

async def get_share_quiz_html(quiz_url: str) -> str:
    html = dedent(f'''
        <div style="font-family:Verdana, sans-serif; background:linear-gradient(135deg,#fff3e0,#ffe0b2);
                    border:2px solid #ff9800; border-radius:14px; padding:26px; max-width:520px;
                    margin:auto; text-align:center; box-shadow:0 6px 14px rgba(0,0,0,0.12);">
            <h2 style="color:#ef6c00; margin-bottom:18px;">🧠 Ready for a Challenge?</h2>
            <p style="color:#444; font-size:16px; line-height:1.6; margin-bottom:22px;">
                Test your knowledge, have some fun, and see how high you can score! 
                Our quiz is quick, engaging, and full of surprises.
            </p>
            <a href="{quiz_url}" style="display:inline-block; background:#fb8c00; color:#fff; text-decoration:none; font-size:18px; font-weight:bold; padding:14px 28px; border-radius:10px; transition:background 0.3s ease;">
                Start the Quiz 🎯
            </a>
            <p style="color:#666; font-size:14px; margin-top:22px;">
                Challenge yourself today and share your results with friends 🔥
            </p>
        </div>
    ''')

    return html

async def get_request_quiz_again(request_username: str, quiz_id: str, quiz_name: str, token: str) -> str:
    html = dedent(f'''
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #333; text-align: center; margin-bottom: 15px;">
                Request to retake the quiz
            </h2>
            <p style="color: #555; font-size: 15px; line-height: 1.5; text-align: center; margin-bottom: 20px;">
                User <strong style="color:#000;">{request_username}</strong> wants to take your quiz again. <br>
                <strong>Quiz: {quiz_name}</strong>
            </p>
            <div style="text-align: center;">
                <a href="{f'http://localhost:5173/confirmation?token={token}&quizId={quiz_id}'}"
                   style="display: inline-block; padding: 12px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; font-size: 15px; font-weight: bold;">
                   Allow replay
                </a>
            </div>
        </div>
    ''')
    return html

async def get_request_survey_again(request_username: str, survey_id: str, survey_name: str, token: str) -> str:
    html = dedent(f"""
        <div style="max-width:600px;margin:auto;padding:20px;
                    background:#fff;border:1px solid #ddd;border-radius:8px;
                    font-family:Arial,sans-serif;">
            <h2 style="color:#333;margin-top:0;">Survey Retry Request</h2>
            <p style="margin:15px 0;font-size:14px;color:#555;">
                User <strong>{request_username}</strong> is requesting to retry survey. <br>
                <strong>Survey: {survey_name}</strong>
            </p>
            <p style="margin:15px 0;font-size:14px;color:#555;">
                Please click the button below to approve the retry:
            </p>
            <a href="{f'http://localhost:5173/confirmation?token={token}&surveyId={survey_id}'}"
               style="display:inline-block;padding:10px 20px;background-color:#0078d7;
                      color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;">
                Retry Survey
            </a>
        </div>
    """)
    return html

async def get_contact_us_html(*, username: str = None, email: str, subject: str, message: str) -> str:
    username_html = (
        f"<tr><td style='padding:8px; border-bottom:1px solid #eee;'><strong style='color:#4A90E2;'>Username:</strong></td><td style='padding:8px; border-bottom:1px solid #eee;'>{username}</td></tr>"
        if username else ""
    )

    html = dedent(f"""
        <div style="font-family:'Segoe UI', Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            <div style="background:#4A90E2; color:#fff; padding:16px; text-align:center; font-size:18px; font-weight:bold;">
                Contact Us Submission
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:14px; color:#333;">
                {username_html}
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #eee;"><strong style="color:#4A90E2;">Email:</strong></td>
                    <td style="padding:8px; border-bottom:1px solid #eee;">{email}</td>
                </tr>
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #eee;"><strong style="color:#4A90E2;">Subject:</strong></td>
                    <td style="padding:8px; border-bottom:1px solid #eee;">{subject}</td>
                </tr>
                <tr>
                    <td style="padding:8px; vertical-align:top;"><strong style="color:#4A90E2;">Message:</strong></td>
                    <td style="padding:8px;">{message}</td>
                </tr>
            </table>
            <div style="background:#f9f9f9; padding:12px; text-align:center; font-size:12px; color:#777;">
                Thank you for reaching out — we’ll get back to you soon!
            </div>
        </div>
    """)

    return html

async def get_verify_email_html(code: int, username: str, email: str) -> str:
    html = dedent(f'''
    <table style="width:100%;max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background-color:#f5f7fb;padding:24px;border-radius:12px;border:1px solid #e0e4f0;">
      <tr>
        <td style="text-align:center;padding-bottom:24px;border-bottom:1px solid #e0e4f0;">
          <div style="font-size:24px;font-weight:bold;color:#1f2933;letter-spacing:0.03em;">Verify your email</div>
          <div style="font-size:14px;color:#6b7280;margin-top:8px;">
            Hi <span style="font-weight:600;color:#111827;">{username}</span>, please confirm that
            <span style="font-weight:600;color:#111827;">{email}</span> belongs to you.
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding-top:24px;padding-bottom:8px;text-align:center;">
          <div style="font-size:13px;text-transform:uppercase;color:#6b7280;letter-spacing:0.18em;margin-bottom:12px;">
            Your verification code
          </div>
          <table style="margin:0 auto;border-spacing:8px;">
            <tr>
              {''.join(
                f'<td style="background-color:#111827;color:#f9fafb;font-size:22px;font-weight:bold;letter-spacing:0.08em;'
                f'padding:12px 16px;border-radius:10px;min-width:40px;text-align:center;border:1px solid #020617;">{d}</td>'
                for d in f"{code:06d}"
              )}
            </tr>
          </table>
          <div style="font-size:13px;color:#6b7280;margin-top:16px;">
            Enter this 6‑digit code in the app to complete your sign‑up.
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding-top:24px;border-top:1px solid #e0e4f0;text-align:center;">
          <div style="font-size:12px;color:#9ca3af;line-height:1.5;">
            If you didn’t request this, you can safely ignore this email.<br/>
            The code will expire shortly for your security.
          </div>
        </td>
      </tr>
    </table>
    ''')

    return html

async def get_change_password_email(username: str, token: str) -> str:
    html = dedent(f"""
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px; text-align: center;">
            <div style="max-width: 500px; margin: auto; background-color: #ffffff; 
                        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
                        padding: 30px;">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">Hello {username},</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                    You requested to change your password. Click the button below to securely update it:
                </p>
                <a href="http://localhost:5173/account/change-password?token={token}" 
                   style="display: inline-block; padding: 14px 28px; background: linear-gradient(90deg,#007BFF,#0056b3); 
                          color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; 
                          font-size: 16px; box-shadow: 0 3px 6px rgba(0,0,0,0.2); transition: background 0.3s ease;">
                    Change Password
                </a>
                <p style="margin-top: 30px; font-size: 13px; color: #888;">
                    If you did not request this, you can safely ignore this email.
                </p>
            </div>
        </div>
    """)
    return html

async def get_two_factor_code_html(username: str, code: int) -> str:
    html = dedent(f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; color: #111827;">
      <h1 style="margin: 0 0 12px; font-size: 22px; line-height: 1.3; font-weight: 700;">Hi, {username}!</h1>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #374151;">
        To complete your sign-in, please enter the six-digit code below in the app.
        If you did not request this, please ignore this message.
      </p>
      <div style="display: inline-block; padding: 14px 18px; border: 1px dashed #9ca3af; border-radius: 10px; background: #f9fafb;">
        <span style="font-size: 24px; font-weight: 700; letter-spacing: 6px; color: #111827;">{code:06d}</span>
      </div>
      <p style="margin: 16px 0 0; font-size: 13px; line-height: 1.5; color: #6b7280;">
        This code is time-sensitive. Do not share it with anyone.
      </p>
    </div>
    """)
    return html
