import { useMemo, useState } from "react";
import "./App.css";

function Input(props) {
  return <input type="text" className="input" {...props} />;
}

function Button(props) {
  return <button type="button" className="button" {...props} />;
}

let timeout;
function debounce(wait, cb) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    cb();
  }, wait);
}

function App() {
  const [verbs, setVerbs] = useState(
    JSON.parse(localStorage.getItem("verbs")) || {}
  );

  const list = Object.entries(verbs);

  const repeatedVerbs = useMemo(() => {
    const result = list.reduce((acc, [group, verbs = []]) => {
      verbs.forEach((verb) => {
        acc[verb] ||= [];
        acc[verb] = [...acc[verb], group];
      });

      return acc;
    }, {});

    return result;
  }, [list]);

  const addGroup = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const groupName = formData.get("group_name");

    if (!groupName) return;

    setVerbs((prevVerbs) => {
      localStorage.setItem(
        "verbs",
        JSON.stringify({ ...prevVerbs, [groupName]: [] })
      );
      return { ...prevVerbs, [groupName]: [] };
    });

    e.target.reset();
  };

  const addVerb = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const groupName = formData.get("group_name");
    const verbName = formData.get("verb_name");

    if (!verbName) return;

    setVerbs((prevVerbs) => {
      const exists = prevVerbs[groupName]?.includes(verbName);

      if (exists) return prevVerbs;

      const newVerbs = {
        ...prevVerbs,
        [groupName]: [...prevVerbs[groupName], verbName],
      };

      localStorage.setItem("verbs", JSON.stringify(newVerbs));
      return newVerbs;
    });

    e.target.reset();
  };

  const removeVerb = (group, verb) => {
    setVerbs((prevVerbs) => {
      const newVerbs = {
        ...prevVerbs,
        [group]: prevVerbs[group].filter((v) => v !== verb),
      };

      localStorage.setItem("verbs", JSON.stringify(newVerbs));
      return newVerbs;
    });
  };

  const updateGroup = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const groupName = formData.get("group_name");
    const newGroupName = formData.get("new_group_name");

    if (!newGroupName) return;

    setVerbs((prevVerbs) => {
      const newVerbs = { ...prevVerbs, [newGroupName]: prevVerbs[groupName] };
      delete newVerbs[groupName];
      localStorage.setItem("verbs", JSON.stringify(newVerbs));
      return newVerbs;
    });

    e.target.reset();
  };

  const removeGroup = (group) => {
    setVerbs((prevVerbs) => {
      const newVerbs = { ...prevVerbs };
      delete newVerbs[group];
      localStorage.setItem("verbs", JSON.stringify(newVerbs));
      return newVerbs;
    });
  };

  const onFormChange = (e) => {
    debounce(500, () => {
      const value = e.target.value;
      const btn = e.target.form.querySelector("button[type=submit]");

      const exists = list.some(([, verbs]) => verbs.includes(value));

      if (exists) {
        e.target.classList.add("invalid");
        btn.setAttribute("disabled", true);
      } else {
        e.target.classList.remove("invalid");
        btn.removeAttribute("disabled");
      }
    });
  };

  return (
    <div className="grid">
      <form onSubmit={addGroup} className="flex items-center">
        <Input
          name="group_name"
          type="text"
          placeholder="Group name"
          autoComplete="off"
        />

        <Button type="submit" name="add_group">
          +
        </Button>
      </form>
      <hr className="w-full" />

      <div>
        {list.map(([group, verbs]) => (
          <div key={group} style={{ marginBottom: 48 }}>
            <div className="flex items-center justify-between">
              <form onSubmit={updateGroup} className="flex">
                <Input type="hidden" name="group_name" value={group} />
                <Input name="new_group_name" defaultValue={group} />
                <Button name="update_group" onClick={() => removeGroup(group)}>
                  x
                </Button>
              </form>
              <form
                onSubmit={addVerb}
                className="flex items-center "
                onChange={onFormChange}
              >
                <Input type="hidden" name="group_name" value={group} />
                <Input
                  type="text"
                  name="verb_name"
                  style={{ marginLeft: "auto" }}
                  placeholder="Verb name"
                  autoComplete="off"
                />

                <Button type="submit" name="add_verb" disabled>
                  +
                </Button>
              </form>
            </div>
            <br />
            <div className="list">
              {verbs.map((verb, i) => (
                <div
                  key={verb + i}
                  className="flex items-center justify-between"
                >
                  <span>{i + 1}. </span>
                  <div className="item-list-content flex flex-1 justify-between">
                    <p>{verb}</p>
                    <p
                      className={
                        repeatedVerbs?.[verb]?.length > 1 ? "repeated-verb" : ""
                      }
                    >
                      {verb}
                    </p>
                  </div>
                  <Button
                    onClick={() => removeVerb(group, verb)}
                    className="button button-danger"
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
