class ApplicationController < ActionController::API
    SECRET_KEY = Rails.application.secret_key_base
  
    def authenticate_request
        header = request.headers['Authorization']
        token = header.split(' ').last if header
  
        begin
            decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
            @current_user = User.find(decoded[0]['user_id'])
        rescue ActiveRecord::RecordNotFound, JWT::DecodeError
            render json: { error: 'Unauthorized' }, status: :unauthorized
        end
    end
end
  