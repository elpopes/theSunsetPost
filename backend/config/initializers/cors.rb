# Be sure to restart your server when you modify this file.
#
# The frontend is served from both the apex and www hostnames. Analytics POSTs
# must accept either origin or browsers will block them before Rails sees them.

allowed_origins = if Rails.env.production?
  ["https://www.sunsetpost.org", "https://sunsetpost.org"]
else
  ["http://localhost:5000"]
end

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ["Authorization"]
  end
end
