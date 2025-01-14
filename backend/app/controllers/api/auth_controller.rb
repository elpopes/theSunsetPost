class Api::AuthController < ApplicationController
    JWT_SECRET_KEY = Rails.application.secret_key_base # Use consistent key
  
    # POST /api/signup
    def signup
        # Correctly access the email from the nested params
        email = params.dig(:user, :email) || params.dig("user", "email") || params[:email]
         
        # Check if the email matches the predefined admin email
        is_admin = (email == ENV['ADMIN_EMAIL'])
    
        # Debugging: Log whether the email matches the admin email
        puts "Is admin: #{is_admin}"
    
        # Prevent further sign-ups after the initial admin is created
        if User.exists? && !is_admin
            render json: { error: "Sign-ups are currently disabled" }, status: :forbidden
            return
        end
    
        user = User.new(user_params)
        user.admin = is_admin
    
        if user.save
            token = generate_token(user.id) # Generate JWT token
            render json: { 
                message: "Sign-up successful", 
                user: { id: user.id, email: user.email, admin: user.admin, token: token } 
            }, status: :created
        else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
    end
  
  
  
    # POST /api/login
    def login
      user = User.find_by(email: params[:email])
  
      if user&.authenticate(params[:password])
        token = generate_token(user.id) # Generate JWT token
        Rails.logger.debug "[#{Time.current}] JWT Token generated for user #{user.email}: #{token}"
        render json: { 
          message: "Login successful", 
          user: { id: user.id, email: user.email, admin: user.admin, token: token } 
        }, status: :ok
      else
        Rails.logger.debug "[#{Time.current}] Login failed for email: #{params[:email]}"
        render json: { error: "Invalid email or password" }, status: :unauthorized
      end
    end
  
    # DELETE /api/logout
    def logout
      session[:user_id] = nil # Invalidate session for compatibility with current setup
      render json: { message: "Logged out successfully" }, status: :ok
    end
  
    private
  
    # Strong parameters for user signup
    def user_params
      params.require(:user).permit(:email, :password)
    end
  
    # Generate a JWT token with an expiration time
    def generate_token(user_id)
      exp = 24.hours.from_now.to_i # Set expiration to 24 hours
      payload = { user_id: user_id, exp: exp }
      JWT.encode(payload, JWT_SECRET_KEY, 'HS256')
    end
end
  