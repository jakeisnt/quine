import { $ } from "@/resources/lib";

// ideas:
// - browse files available
// - open new windows with animations
// - open files in new windows
// - use functions remotely
// - control things in my real life
// - browse/analyze/visualize my personal data

// biggest problem: this thing goes away when i browse to another page

(() => {
  $(".terminal").terminal(
    function (command, term) {
      term.pause();
      term.echo("I can't do much yet.").resume();
    },
    {
      greetings: "Welcome to `jake.isnt.online`.",
    }
  );
})();
