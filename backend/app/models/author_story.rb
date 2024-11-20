class AuthorStory < ApplicationRecord
  belongs_to :story
  belongs_to :author
end
