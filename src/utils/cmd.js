const { exec, execSync } = window.require("child_process");

export function runCommand(command, callback) {
  return exec(
    command,
    (function () {
      return function (err, data, stderr) {
        if (!callback) return;

        callback(err, data, stderr);
      };
    })(callback)
  );
}

export function runSync(command) {
  try {
    return {
      data: execSync(command).toString(),
      err: null,
      stderr: null,
    };
  } catch (error) {
    return {
      data: null,
      err: error.stderr.toString(),
      stderr: error.stderr.toString(),
    };
  }
}
