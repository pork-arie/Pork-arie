import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState } from "react";

import { project } from "../data/data";
import { div } from "framer-motion/client";

function Detail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [view, setView] = useState(null);

  const ref = useRef(null);

  const left = () => {
    ref.current?.scrollBy({ left: -360, behavior: "smooth" });
  };

  const rigth = () => {
    ref.current?.scrollBy({ left: 360, behavior: "smooth" });
  };

  const pro = project.find((p) => p.id === Number(id));

  return (
    <>
      <section className="D">
        <button className="back" onClick={() => nav("/")}>
          back
        </button>
        <div className="dd">
          <div className="slides">
            <button className="dscroll left" onClick={left}>
              <svg
                className="dbt"
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M13.729 5.575c1.304-1.074 3.27-.146 3.27 1.544v9.762c0 1.69-1.966 2.618-3.27 1.544l-5.927-4.881a2 2 0 0 1 0-3.088l5.927-4.88Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <div className="pics" ref={ref}>
              <img
                src={pro.img1}
                alt=""
                id="dimg"
                onClick={() => setView(pro.img1)}
              />
              <img
                src={pro.img}
                alt=""
                id="dimg"
                onClick={() => setView(pro.img)}
              />
              <img
                src={pro.img2}
                alt=""
                id="dimg"
                onClick={() => setView(pro.img2)}
              />
              <img
                src={pro.img3}
                alt=""
                id="dimg"
                onClick={() => setView(pro.img3)}
              />
            </div>
            <button className="dscroll rigth" onClick={rigth}>
              <svg
                className="dbt"
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.271 5.575C8.967 4.501 7 5.43 7 7.12v9.762c0 1.69 1.967 2.618 3.271 1.544l5.927-4.881a2 2 0 0 0 0-3.088l-5.927-4.88Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <h1>{pro.name}</h1>
          <p>{pro.description}</p>
          <div className="stack-tags">
            {pro.stack.map((tech) => (
                <span key={tech} className="tech-pill">{tech}</span>
            ))}
          </div>

        </div>

        {view && (
          <div className="lightbox-overlay" onClick={() => setView(null)}>
            <div
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={view} />
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default Detail;
