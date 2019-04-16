// Object.defineProperty(classPrototype, methodName, descriptor)

function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function logBefore(target, key, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args) {
    console.log(`[LOGGER]: I'm going to tell a joke.`);
    return originalMethod.call(this, ...args);
  };
  return descriptor;
}

function logAfter(target, key, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function(...args) {
    const value = await originalMethod.call(this, ...args);
    console.log(`[LOGGER]: I told a joke: "${value}"`);
    return value;
  };
  return descriptor;
}

function logError(target, key, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args) {
    try {
      return originalMethod.call(this, ...args);
    } catch (err) {
      console.error(
        `[LOGGER]: Could not tell a joke, because "${err.message}".`
      );
      throw err;
    }
  };
  return descriptor;
}

class Joke {
  @readonly
  default = "default joke";

  @logBefore
  @logAfter
  random() {
    return fetch("https://official-joke-api.appspot.com/random_joke")
      .then(res => res.json())
      .then(joke => `${joke.setup} ${joke.punchline}`);
  }

  @logError
  error() {
    throw new Error("AN ERROR");
  }
}

const joke = new Joke();

const randomButton = document.querySelector("#random-joke");
randomButton.onclick = () => {
  joke.random();
};

const assignReadonlyButton = document.querySelector("#assign-readonly");
assignReadonlyButton.onclick = () => {
  try {
    joke.default = "a new default joke";
  } catch (err) {
    console.error(err);
  }
};

const errorJokeButton = document.querySelector("#error-joke");
errorJokeButton.onclick = () => {
  try {
    joke.error();
  } catch (err) {}
};
