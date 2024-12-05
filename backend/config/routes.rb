Rails.application.routes.draw do
    namespace :api do
        resources :sections, only: [:index, :show]
        resources :stories, only: [:index, :show, :create]
        resources :authors, only: [:index, :show, :create]
        get 'transit', to: 'transit#get_transit_info'
        get 'weather', to: 'weather#fetch_weather'
        post 'signup', to: 'auth#signup'
        post 'login', to: 'auth#login'
        post 'contact', to: 'contact#create'
        delete 'logout', to: 'auth#logout'
    end
end
  