Rails.application.routes.draw do
    root to: ->(env) { [200, { "Content-Type" => "text/plain" }, ["API is live"]] }
  
    get "/preview/stories/:slug", to: "previews#story"
  
    namespace :api do
      get 'sections/name/:name', to: 'sections#show_by_name'
      resources :sections, only: [:index]
  
      resources :stories, only: [:index, :show, :create, :update, :destroy]
      resources :authors, only: [:index, :show, :create]
  
      # API endpoints
      get 'transit', to: 'transit#get_transit_info'
      get 'weather', to: 'weather#fetch_weather'
      post 'signup', to: 'auth#signup'
      post 'login', to: 'auth#login'
      post 'contact', to: 'contact#create'
      delete 'logout', to: 'auth#logout'
  
      # Image upload endpoint for inline editor images
      post 'upload_image', to: 'stories#upload_image'
    end
  end
  