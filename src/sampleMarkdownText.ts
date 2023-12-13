export const sampleMarkdownText = `# Bulleted list with inline formatting
* **bold item**
* *italic item*
* ~~strikethrough item~~
* \`monospace item\`
***
## Ordered list with different style links
* https://google.com
* [Google](https://google.com)
***
### Blockquote
> Some quote from another source
***
#### Code block
\`\`\`ts
class Person {
    private name: string;
    private age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    toString(): string {
        return \`\${this.name} (\${this.age}) (\${this.salary})\`;
    }
}
\`\`\`
`;
