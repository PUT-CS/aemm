import { Text } from "~/components/authoring/Text/Text";
import { DemoContainer } from "./DemoContainer";

export default function TextDemo() {
  return (
    <>
      <DemoContainer title={"Simple text"}>
        <Text text={"Example Simple Text"} />
      </DemoContainer>
      <DemoContainer title={"HTML paragraph"}>
        <Text text={"<p>This is a paragraph</p>"} />
      </DemoContainer>
      <DemoContainer title={"h1"}>
        <Text text={"<h1>Hello, this is Gabe Newell</h1>"} />
      </DemoContainer>
      <DemoContainer title={"h2"}>
        <Text text={"<h2>Hello, this is Gabe Newell</h2>"} />
      </DemoContainer>
      <DemoContainer title={"h3"}>
        <Text text={"<h3>Hello, this is Gabe Newell</h3>"} />
      </DemoContainer>
      <DemoContainer title={"h4"}>
        <Text text={"<h4>Hello, this is Gabe Newell</h4>"} />
      </DemoContainer>
      <DemoContainer title={"h5"}>
        <Text text={"<h5>Hello, this is Gabe Newell</h5>"} />
      </DemoContainer>
      <DemoContainer title={"h6"}>
        <Text text={"<h6>Hello, this is Gabe Newell</h6>"} />
      </DemoContainer>
      <DemoContainer title={"Title and paragraph"}>
        <Text
          text={
            "<h4>Hello, this is Gabe Newell</h4>" +
            "<p>The founder of Valve</p>"
          }
        />
      </DemoContainer>
      <DemoContainer title={"Formatted text"}>
        <Text
          text={
            "<h4>Hello, this is Gabe Newell</h4>" +
            "<p>You've just achieved <strong>first blood</strong>. <i>Thank you for playing and have fun.</i></p>"
          }
        />
      </DemoContainer>
      <DemoContainer title={"Unordered List"}>
        <Text
          text={
            "<ul>" +
            "<li>Counter-Strike</li>" +
            "<li>Half-Life</li>" +
            "<li>Portal</li>" +
            "</ul>"
          }
        />
      </DemoContainer>
      <DemoContainer title={"Ordered List"}>
        <Text
          text={
            "<ol>" +
            "<li>Download Steam</li>" +
            "<li>Create an account</li>" +
            "<li>Purchase the game</li>" +
            "</ol>"
          }
        />
      </DemoContainer>
      <DemoContainer title={"Inline Code"}>
        <Text
          text={
            "<p>Use the <code>sv_cheats 1</code> command to enable cheats.</p>"
          }
        />
      </DemoContainer>
      <DemoContainer title={"Blockquote"}>
        <Text
          text={
            "<blockquote>The right man in the wrong place can make all the difference in the world.</blockquote>"
          }
        />
      </DemoContainer>
      <DemoContainer title={"Complex Content"}>
        <Text
          text={
            "<h5>Quick Start Guide</h5>" +
            "<p>Follow these steps to get started:</p>" +
            "<ol>" +
            "<li>Install the required dependencies</li>" +
            "<li>Configure your <code>settings.json</code> file</li>" +
            "<li>Run the application</li>" +
            "</ol>" +
            "<blockquote>Note: Make sure you have administrator privileges.</blockquote>"
          }
        />
      </DemoContainer>
    </>
  );
}
