# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_06_25_110000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "author_stories", force: :cascade do |t|
    t.bigint "story_id", null: false
    t.bigint "author_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_author_stories_on_author_id"
    t.index ["story_id"], name: "index_author_stories_on_story_id"
  end

  create_table "author_translations", force: :cascade do |t|
    t.bigint "author_id", null: false
    t.text "bio"
    t.string "language", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_author_translations_on_author_id"
  end

  create_table "authors", force: :cascade do |t|
    t.string "name", null: false
    t.text "bio"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.index ["slug"], name: "index_authors_on_slug", unique: true
  end

  create_table "classified_categories", force: :cascade do |t|
    t.string "slug", null: false
    t.integer "position", null: false
    t.boolean "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "classified_category_translations", force: :cascade do |t|
    t.bigint "classified_category_id", null: false
    t.string "language"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["classified_category_id", "language"], name: "idx_on_classified_category_id_language_3b2e067262", unique: true
    t.index ["classified_category_id"], name: "idx_on_classified_category_id_a0aaf0d7a1"
  end

  create_table "classified_subcategories", force: :cascade do |t|
    t.bigint "classified_category_id", null: false
    t.string "slug", null: false
    t.integer "position", null: false
    t.boolean "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["classified_category_id"], name: "index_classified_subcategories_on_classified_category_id"
  end

  create_table "classified_subcategory_translations", force: :cascade do |t|
    t.bigint "classified_subcategory_id", null: false
    t.string "language"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["classified_subcategory_id", "language"], name: "idx_on_classified_subcategory_id_language_66c2dda437", unique: true
    t.index ["classified_subcategory_id"], name: "idx_on_classified_subcategory_id_a37d186a49"
  end

  create_table "classified_translations", force: :cascade do |t|
    t.bigint "classified_id", null: false
    t.string "language"
    t.string "title"
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["classified_id", "language"], name: "index_classified_translations_on_classified_id_and_language", unique: true
    t.index ["classified_id"], name: "index_classified_translations_on_classified_id"
  end

  create_table "classifieds", force: :cascade do |t|
    t.string "slug", null: false
    t.integer "status"
    t.datetime "posted_at"
    t.datetime "expires_at"
    t.string "submitter_email"
    t.text "admin_notes"
    t.bigint "classified_category_id", null: false
    t.bigint "classified_subcategory_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "link_url"
    t.index ["classified_category_id"], name: "index_classifieds_on_classified_category_id"
    t.index ["classified_subcategory_id"], name: "index_classifieds_on_classified_subcategory_id"
    t.index ["slug"], name: "index_classifieds_on_slug", unique: true
  end

  create_table "section_stories", force: :cascade do |t|
    t.bigint "story_id", null: false
    t.bigint "section_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["section_id"], name: "index_section_stories_on_section_id"
    t.index ["story_id"], name: "index_section_stories_on_story_id"
  end

  create_table "section_translations", force: :cascade do |t|
    t.bigint "section_id", null: false
    t.string "name", null: false
    t.text "description"
    t.string "language", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["section_id"], name: "index_section_translations_on_section_id"
  end

  create_table "sections", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "stories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.index ["slug"], name: "index_stories_on_slug", unique: true
  end

  create_table "story_translations", force: :cascade do |t|
    t.bigint "story_id", null: false
    t.string "title"
    t.text "content"
    t.string "language"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "meta_description"
    t.text "caption"
    t.index ["story_id"], name: "index_story_translations_on_story_id"
  end

  create_table "story_views", force: :cascade do |t|
    t.bigint "story_id", null: false
    t.string "visitor_token", null: false
    t.string "language", null: false
    t.string "path", null: false
    t.text "query_string"
    t.text "referrer"
    t.text "user_agent"
    t.string "utm_source"
    t.string "utm_medium"
    t.string "utm_campaign"
    t.string "utm_content"
    t.string "source_type", default: "unknown", null: false
    t.string "ip_hash"
    t.integer "engaged_seconds", default: 0, null: false
    t.integer "max_scroll_percent", default: 0, null: false
    t.datetime "viewed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ip_hash", "viewed_at"], name: "index_story_views_on_ip_hash_and_viewed_at"
    t.index ["language", "viewed_at"], name: "index_story_views_on_language_and_viewed_at"
    t.index ["source_type", "viewed_at"], name: "index_story_views_on_source_type_and_viewed_at"
    t.index ["story_id", "viewed_at"], name: "index_story_views_on_story_id_and_viewed_at"
    t.index ["story_id"], name: "index_story_views_on_story_id"
    t.index ["utm_campaign", "viewed_at"], name: "index_story_views_on_utm_campaign_and_viewed_at"
    t.index ["visitor_token", "story_id", "viewed_at"], name: "index_story_views_on_visitor_story_and_viewed_at"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.boolean "admin"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "author_stories", "authors"
  add_foreign_key "author_stories", "stories"
  add_foreign_key "author_translations", "authors"
  add_foreign_key "classified_category_translations", "classified_categories"
  add_foreign_key "classified_subcategories", "classified_categories"
  add_foreign_key "classified_subcategory_translations", "classified_subcategories"
  add_foreign_key "classified_translations", "classifieds"
  add_foreign_key "classifieds", "classified_categories"
  add_foreign_key "classifieds", "classified_subcategories"
  add_foreign_key "section_stories", "sections"
  add_foreign_key "section_stories", "stories"
  add_foreign_key "section_translations", "sections"
  add_foreign_key "story_translations", "stories"
  add_foreign_key "story_views", "stories"
end
