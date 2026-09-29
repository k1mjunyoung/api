(function () {
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function countLabel(value) {
    if (Array.isArray(value)) {
      return value.length + (value.length === 1 ? " item" : " items");
    }
    var n = Object.keys(value).length;
    return n + (n === 1 ? " key" : " keys");
  }

  function renderPrimitive(value) {
    var span = el("span");
    if (typeof value === "string") {
      span.className = "string";
      if (/^https?:\/\//.test(value)) {
        span.appendChild(document.createTextNode('"'));
        var a = document.createElement("a");
        a.href = value;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "link";
        a.textContent = value;
        span.appendChild(a);
        span.appendChild(document.createTextNode('"'));
      } else {
        span.textContent = JSON.stringify(value);
      }
    } else if (typeof value === "number") {
      span.className = "number";
      span.textContent = String(value);
    } else if (typeof value === "boolean") {
      span.className = "boolean";
      span.textContent = String(value);
    } else {
      span.className = "null";
      span.textContent = "null";
    }
    return span;
  }

  function makeLine(depth) {
    var line = el("div", "line");
    line.style.paddingLeft = depth * 1.1 + 2 + "rem";
    return line;
  }

  function renderNode(parent, value, key, isLast, depth) {
    var isContainer = value !== null && typeof value === "object";

    if (!isContainer) {
      var line = makeLine(depth);
      line.appendChild(el("span", "spacer"));
      if (key !== null) {
        line.appendChild(el("span", "key", '"' + key + '"'));
        line.appendChild(el("span", "punct", ": "));
      }
      line.appendChild(renderPrimitive(value));
      line.appendChild(el("span", "punct", isLast ? "" : ","));
      parent.appendChild(line);
      return;
    }

    var isArray = Array.isArray(value);
    var node = el("div", "node");

    var header = makeLine(depth);
    var toggle = el("span", "toggle");
    header.appendChild(toggle);
    if (key !== null) {
      header.appendChild(el("span", "key", '"' + key + '"'));
      header.appendChild(el("span", "punct", ": "));
    }
    header.appendChild(el("span", "punct", isArray ? "[" : "{"));
    header.appendChild(
      el("span", "summary", " " + countLabel(value) + " "),
    );
    header.appendChild(
      el(
        "span",
        "punct close-inline",
        (isArray ? "]" : "}") + (isLast ? "" : ","),
      ),
    );
    node.appendChild(header);

    var children = el("div", "children");
    var entries = isArray
      ? value.map(function (v, i) {
          return [null, v];
        })
      : Object.keys(value).map(function (k) {
          return [k, value[k]];
        });
    entries.forEach(function (pair, idx) {
      renderNode(
        children,
        pair[1],
        pair[0],
        idx === entries.length - 1,
        depth + 1,
      );
    });
    node.appendChild(children);

    var closeLine = makeLine(depth);
    closeLine.className += " close-line";
    closeLine.appendChild(el("span", "spacer"));
    closeLine.appendChild(
      el("span", "punct", (isArray ? "]" : "}") + (isLast ? "" : ",")),
    );
    node.appendChild(closeLine);

    toggle.addEventListener("click", function () {
      node.classList.toggle("collapsed");
    });

    parent.appendChild(node);
  }

  fetch("data.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderNode(document.getElementById("json-root"), data, null, true, 0);
      document.getElementById("raw-text").textContent = JSON.stringify(
        data,
        null,
        2,
      );

      document
        .getElementById("btn-parsed")
        .addEventListener("click", function () {
          document.body.classList.remove("raw-mode");
          this.classList.add("active");
          document.getElementById("btn-raw").classList.remove("active");
        });
      document
        .getElementById("btn-raw")
        .addEventListener("click", function () {
          document.body.classList.add("raw-mode");
          this.classList.add("active");
          document.getElementById("btn-parsed").classList.remove("active");
        });

      /*
      document
        .getElementById("btn-copy")
        .addEventListener("click", function () {
          var text = JSON.stringify(data, null, 2);
          var btn = this;
          function done() {
            var original = "Copy";
            btn.textContent = "Copied";
            btn.classList.add("copied");
            setTimeout(function () {
              btn.textContent = original;
              btn.classList.remove("copied");
            }, 1200);
          }
          try {
            navigator.clipboard.writeText(text).then(done, function () {
              fallbackCopy(text, done);
            });
          } catch (e) {
            fallbackCopy(text, done);
          }
          function fallbackCopy(t, cb) {
            try {
              var ta = document.createElement("textarea");
              ta.value = t;
              ta.style.position = "fixed";
              ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.select();
              document.execCommand("copy");
              document.body.removeChild(ta);
              cb();
            } catch (e2) {}
          }
        });
    */
    });
})();
