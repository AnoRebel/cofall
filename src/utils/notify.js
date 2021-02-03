const notifier = require("node-notifier");

const sendNotification = data => {
  // TODO: implement platform specific
  let notifyMsg;
  if (data.message.length >= 120) {
    notifyMsg = `${data.message.substring(0, 117)}...`;
  } else {
    notifyMsg = data.message;
  }

  if (user !== data.user) {
    notifier.notify(
      {
        title: `(Cofall) Message from ${data.user}`,
        subtitle: `New message from ${data.user}`,
        message: notifyMsg, // Absolute path (doesn't work on balloons)
        sound: true, // Only Notification Center or Windows Toasters
        wait: true, // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
        timeout: 5, // Takes precedence over wait if both are defined.
      },
      (err, response, metadata) => {
        // Response is response from notification
        // Metadata contains activationType, activationAt, deliveredAt
        if (err) return [false, err];
        console.log(response, metadata);
        return [true, [response, metadata]];
      }
    );
  }

  notifier.on("click", (notifierObject, options, event) => {
    // Triggers if `wait: true` and user clicks notification
    console.log(notifierObject, options, event);
  });

  notifier.on("timeout", (notifierObject, options) => {
    // Triggers if `wait: true` and notification closes
    console.log(notifierObject, options);
  });
};

module.exports = sendNotification;