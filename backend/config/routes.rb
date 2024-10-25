Rails.application.routes.draw do
    namespace :api do
        resources :stories, only: [:index]
    end
end
  
