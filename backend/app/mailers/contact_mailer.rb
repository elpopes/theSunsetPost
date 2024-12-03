class ContactMailer < ApplicationMailer
    def contact_email(name, email, message)
      @name = name
      @message = message
  
      mail(
        to: "editor@sunsetpost.org", 
        from: "editor@sunsetpost.org", 
        reply_to: email,          
        subject: "New Contact Form Submission"
      )
    end
end
  