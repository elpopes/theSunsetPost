Rails.application.routes.draw do
    namespace :api do
        resources :sections, only: [:index, :show]
        resources :stories, only: [:index, :show, :create] 
        resources :stories, only: [:index, :show, :create]
        resources :authors, only: [:index, :show, :create]
        get 'transit', to: 'transit#get_transit_info'
        post 'signup', to: 'auth#signup'
        post 'login', to: 'auth#login'
        delete 'logout', to: 'auth#logout'
    end
end
  