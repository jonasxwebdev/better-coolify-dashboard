import { useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { customSyntaxTheme } from "../../styles/syntaxTheme";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../utils/soundUtils";

const YamlModal = ({ name, content, onClose }) => {
  const { playSound } = useSoundEffects();

  const handleClose = () => {
    playSound(SOUND_TYPES.CLICK);
    // Remove focus from any button when closing
    if (document.activeElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-popover rounded-xl border border-border max-w-4xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Docker Compose - {name}
          </h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition cursor-pointer font-bold text-xl"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <SyntaxHighlighter
            language="yaml"
            style={customSyntaxTheme}
            showLineNumbers={true}
            customStyle={{
              borderRadius: "0.5rem",
              backgroundColor: "hsl(var(--background))",
              border: "none",
              margin: 0,
            }}
            codeTagProps={{
              style: {
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.875rem",
              },
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default YamlModal;
