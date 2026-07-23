class PrintIssue < ApplicationRecord
  has_many :print_story_placements, dependent: :destroy
  has_many :stories, through: :print_story_placements

  validates :code, :name, presence: true
  validates :code,
            uniqueness: true,
            format: {
              with: /\A\d{4}-(0[1-9]|1[0-2])\z/,
              message: "must use YYYY-MM format"
            }
  validates :copies_printed,
            numericality: { only_integer: true, greater_than: 0 },
            allow_nil: true
end
