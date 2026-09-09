import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./ContactForm.css";
import { baseURL } from "../config";

const ContactForm = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(t("contact_page.sending_status"));
    try {
      const response = await fetch(`${baseURL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus(t("contact_page.success_status"));
        setFormData({ name: "", email: "", message: "" });
      } else {
        const { error } = await response.json();
        setStatus(t("contact_page.failure_status", { error }));
      }
    } catch (error) {
      setStatus(t("contact_page.error_status"));
    }
  };

  return (
    <div className="contact-form-container">
      <h2>{t("contact_page.title")}</h2>
      <p className="welcome-text">{t("contact_page.welcome_text")}</p>
      <p className="recruitment-text">{t("contact_page.recruitment_text")}</p>
      <form onSubmit={handleSubmit} className="contact-form">
        <label htmlFor="name">{t("contact_page.name_label")}</label>
        <input
          type="text"
          name="name"
          id="name"
          placeholder={t("contact_page.name_placeholder")}
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">{t("contact_page.email_label")}</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder={t("contact_page.email_placeholder")}
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="message">{t("contact_page.message_label")}</label>
        <textarea
          name="message"
          id="message"
          placeholder={t("contact_page.message_placeholder")}
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>

        <button type="submit">{t("contact_page.send_button")}</button>
        <p className="status-message">{status}</p>
      </form>
    </div>
  );
};

export default ContactForm;
