import { SIGNAL_TASKS, type SignalState } from "@/lib/signal";

export function SignalTasks({ done, mark, complete, remaining, ready }: SignalState) {
  return (
    <div>
      <ol>
        {SIGNAL_TASKS.map((task) => {
          const isDone = done.has(task.id);
          return (
            <li
              key={task.id}
              className={`flex flex-col gap-4 border-t border-rule py-8 md:flex-row md:items-center md:justify-between md:gap-10 ${
                isDone ? "task-done" : ""
              }`}
            >
              <div className="flex gap-5 md:gap-8">
                <span className="task-num pt-0.5">{task.num}</span>
                <p className="measure text-pretty text-body leading-normal text-type">
                  {task.title}
                </p>
              </div>
              <div className="shrink-0 pl-11 md:pl-0">
                <a
                  className="btn-ghost"
                  href={task.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    window.setTimeout(() => mark(task.id), 400);
                  }}
                >
                  {isDone ? "Done" : "Open X"}
                </a>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-8 text-legal text-mute">
        {ready
          ? complete
            ? "Signal complete. Wallet is open."
            : `${remaining} remaining before the wallet opens.`
          : "Signal required."}
      </p>
    </div>
  );
}
