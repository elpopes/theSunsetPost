class Api::AuthController < ApplicationController
	# POST /api/signup
	def signup
		# Check if the email matches the predefined admin email
		# is_admin = (params[:email] == ENV['ADMIN_EMAIL'])
        is_admin = true

		# Prevent further sign-ups after the initial admin is created
		if User.exists? && !is_admin
			render json: { error: "Sign-ups are currently disabled" }, status: :forbidden
			return
		end

		user = User.new(user_params)
		user.admin = is_admin

		if user.save
			session[:user_id] = user.id
			render json: { message: "Sign-up successful", user: { id: user.id, email: user.email, admin: user.admin } }, status: :created
		else
			render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
		end
	end

	# POST /api/login
	def login
        user = User.find_by(email: params[:email])
    
        if user&.authenticate(params[:password])
            session[:user_id] = user.id
            Rails.logger.debug "User logged in successfully: #{user.inspect}"
            render json: { message: "Login successful", user: { id: user.id, email: user.email, admin: user.admin } }, status: :ok
        else
            Rails.logger.debug "Login failed for email: #{params[:email]}"
            render json: { error: "Invalid email or password" }, status: :unauthorized
        end
    end

	# DELETE /api/logout
	def logout
		session[:user_id] = nil
		render json: { message: "Logged out successfully" }, status: :ok
	end

	private

	def user_params
		params.require(:user).permit(:email, :password)
	end
end
