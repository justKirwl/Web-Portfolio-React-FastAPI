from textwrap import dedent

def get_auth_send_code_html(email: str, code: int) -> str:
    html = dedent(f"""
        <div style="background-color:#f0f0f0;padding:40px;font-family:Arial,sans-serif;">
            <div style="max-width:500px;margin:0 auto;background-color:#ffffff;
                        border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);
                        padding:30px;text-align:center;">
                <h2 style="color:#1e3a8a;margin-bottom:20px;">Email Login Code</h2>
                <p style="color:#333333;font-size:16px;margin-bottom:30px;">
                    Hello <strong>{email.strip('@')[0]}</strong>, please enter the following code to authorize:
                </p>
                <div style="background-color:#1e3a8a;color:#ffffff;font-size:32px;
                            font-weight:bold;letter-spacing:4px;padding:15px 0;
                            border-radius:6px;">
                    {code:06d}
                </div>
                <p style="color:#666666;font-size:14px;margin-top:30px;">
                    This code is valid for 5 minutes. Do not share it with anyone.
                </p>
            </div>
        </div>
    """)

    return html

def get_feedback_html(email: str, feedback_message: str) -> str:
    html = dedent(f"""
        <div style="background-color:#f0f0f0;padding:40px;font-family:Arial,sans-serif;">
            <div style="max-width:500px;margin:0 auto;background-color:#ffffff;
                        border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.1);
                        padding:30px;text-align:center;">
                <h2 style="color:#1e3a8a;margin-bottom:20px;">User Feedback</h2>
                <p style="color:#333333;font-size:16px;margin-bottom:20px;">
                    <strong>{email}</strong> has submitted the following feedback:
                </p>
                <div style="background-color:#f9fafb;color:#1e293b;font-size:15px;
                            padding:20px;border-radius:6px;border:1px solid #e5e7eb;
                            text-align:left;white-space:pre-wrap;">
                    {feedback_message}
                </div>
                <p style="color:#666666;font-size:14px;margin-top:30px;">
                    Thank you for helping us improve.
                </p>
            </div>
        </div>
    """)
    
    return html