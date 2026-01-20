import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchClassifiedByIdOrSlug } from "../features/classifieds/classifiedsSlice";

const resolveUrl = (url, baseURL) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseURL}${url}`;
};

const ClassifiedDetailPage = ({ lang = "en", baseURL }) => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { selected, selectedStatus, error } = useSelector((s) => s.classifieds);

  useEffect(() => {
    dispatch(fetchClassifiedByIdOrSlug({ idOrSlug: slug, lang }));
  }, [dispatch, slug, lang]);

  if (selectedStatus === "loading") return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!selected) return <p>Not found.</p>;

  const img = resolveUrl(selected.photo_url, baseURL);

  return (
    <div className="classified-detail">
      <h1>{selected.title}</h1>
      {img ? <img src={img} alt="" /> : null}
      <p>
        {selected.category?.name}
        {selected.subcategory?.name ? ` / ${selected.subcategory.name}` : ""}
      </p>
      <div>{selected.body}</div>
    </div>
  );
};

export default ClassifiedDetailPage;
