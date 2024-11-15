Rails.application.config.session_store :cookie_store, key: '_your_app_session', expire_after: 14.days, secure: Rails.env.production?, same_site: :strict
