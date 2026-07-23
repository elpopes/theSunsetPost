require "test_helper"

class PrintIssueTest < ActiveSupport::TestCase
  test "requires a year-month campaign code" do
    issue = PrintIssue.new(code: "July", name: "July 2026")

    assert_not issue.valid?
    assert_includes issue.errors[:code], "must use YYYY-MM format"
  end

  test "accepts a valid issue" do
    issue = PrintIssue.new(
      code: "2026-07",
      name: "July 2026",
      copies_printed: 4_000
    )

    assert issue.valid?
  end
end
