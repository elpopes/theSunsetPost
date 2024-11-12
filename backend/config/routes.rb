Rails.application.routes.draw do
    namespace :api do
        resources :stories, only: [:index, :show, :create] 
        get 'transit', to: 'transit#get_transit_info'
    end
end
  