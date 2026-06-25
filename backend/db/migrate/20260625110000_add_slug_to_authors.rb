class AddSlugToAuthors < ActiveRecord::Migration[7.1]
  class MigrationAuthor < ActiveRecord::Base
    self.table_name = "authors"
  end

  def up
    add_column :authors, :slug, :string unless column_exists?(:authors, :slug)

    MigrationAuthor.reset_column_information

    MigrationAuthor.find_each do |author|
      base_slug = author.name.to_s.parameterize.presence || "author-#{author.id}"
      candidate = base_slug
      suffix = 2

      while MigrationAuthor.where(slug: candidate).where.not(id: author.id).exists?
        candidate = "#{base_slug}-#{suffix}"
        suffix += 1
      end

      author.update_columns(slug: candidate, updated_at: Time.current)
    end

    add_index :authors, :slug, unique: true unless index_exists?(:authors, :slug)
  end

  def down
    remove_index :authors, :slug if index_exists?(:authors, :slug)
    remove_column :authors, :slug if column_exists?(:authors, :slug)
  end
end
