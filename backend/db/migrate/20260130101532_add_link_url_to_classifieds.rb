class AddLinkUrlToClassifieds < ActiveRecord::Migration[7.1]
  def change
    add_column :classifieds, :link_url, :string
  end
end
