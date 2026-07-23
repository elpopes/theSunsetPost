class PrintStoryPlacement < ApplicationRecord
  LANGUAGES = %w[en es zh].freeze

  belongs_to :print_issue
  belongs_to :story

  validates :print_language, :target_language, presence: true
  validates :print_language, :target_language, inclusion: { in: LANGUAGES }
  validates :page_number,
            numericality: { only_integer: true, greater_than: 0 },
            allow_nil: true
  validates :story_id,
            uniqueness: {
              scope: [:print_issue_id, :print_language, :target_language],
              message: "already has this language placement in the issue"
            }
end
