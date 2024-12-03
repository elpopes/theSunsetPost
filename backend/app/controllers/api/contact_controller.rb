module Api
    class ContactController < ApplicationController
        def create
        # Extract permitted parameters
        contact_params = permitted_contact_params
    
        name = contact_params[:name]
        email = contact_params[:email]
        message = contact_params[:message]
    
        # Validate form inputs
        if name.blank? || email.blank? || message.blank?
            render json: { error: "All fields are required." }, status: :unprocessable_entity
            return
        end
    
        # Send email
        ContactMailer.contact_email(name, email, message).deliver_now
        render json: { success: "Message sent successfully!" }, status: :ok
        rescue => e
        Rails.logger.error("Error sending email: #{e.message}")
        render json: { error: "Failed to send message." }, status: :internal_server_error
        end
    
        private
    
        def permitted_contact_params
        params.require(:contact).permit(:name, :email, :message)
        end
    end
end