
/**
 * 解析源码并返回所有标记列表。
 */
function parseDoc(content) {
    var reader = new SourceReader(content);
    var docComments = getAllDocComments(reader);
    return docComments;
}

/**
 * 获取源码中所有文档注释。
 */
function getAllDocComments(reader) {

    var docComments = [],
        docComment,
        lastPos,
        token = reader.readTo("///", "/**");

    // 提取所有注释原始信息。
    while (token) {

        if (token.content === "///") {
            reader.readTo("\n");
            hasSingleLineComments = true;
        } else {
            reader.readTo("*/");
        }

        // 保存当前文档注释内容。
        docComment = {
            type: token.content,
            line: token.line,
            col: token.col,
            indent: token.indent,
            content: reader.source.substring(token.pos, lastPos = reader.pos)
        };

        // 多读取 2 行文本，以便之后提取信息。
        while (token = reader.readTo("///", "/**", "\n")) {

            // 连续多个 /// 合并为一个注释。
            if (token.content === "///" && docComment.type === "///") {
                reader.readTo("\n");
                docComment.content += "\n" + reader.source.substring(token.pos, lastPos = reader.pos);
                continue;
            }

            // 继续读取一行。
            if (token.content === "\n") {
                token = reader.readTo("///", "/**", "\n");
            }
            break;
        }

        // 跳过当前换行。
        if (token && token.content === "\n") {
            token = reader.readTo("///", "/**");
        }

        // 解析剩余部分。
        docComment.rest = reader.source.substring(lastPos + 1, (token || reader).pos);
        docComment.contentParsed = (docComment.type === "///" ? docComment.content.replace(/^\s*\/\/\/\s*/gm, "") : docComment.content.substring("/**".length, docComment.content.length - "*/".length).replace(/^\s*\*\s*/mg, "")).trim();
        docComment.tags = parseDocComment(docComment.contentParsed);
        docComments.push(docComment);

    }

    return docComments;
}

function parseDocComment(comment) {
    var result = {};


    return result;
};

/**
 * 表示一个源码读取器。
 */
function SourceReader(source) {
    this.source = source.replace(/\r\n?/g, "\n");
    this.line = this.col = 1;
    this.indent = 0;
    this.pos = -1;
}

SourceReader.prototype = {

    tabSize: 4,

    /**
     * 读取下一个字符。
     */
    read: function () {
        var ch = this.source.charAt(++this.pos);

        // 如果读到 \r 或 \n
        if (ch === '\n') {
            this.line++;
            this.col = 1;
            this.indent = 0;
        } else if (ch === ' ') {
            this.indent++;
        } else if (ch === '\t') {
            this.indent += this.tabSize;
        }
        return ch;
    },

    /**
     * 预览紧跟的字符。
     */
    peek: function (peekCount) {
        return this.source.substr(this.pos, peekCount || 1);
    },

    /**
     * 读取文本直到出现指定字符。
     * @returns {Object} 返回结果对象。
     * - content
     * - line
     * - col
     * - pos
     */
    readTo: function () {
        var ch;
        while (ch = this.read()) {
            for (var i = 0, content, result; i < arguments.length; i++) {
                content = arguments[i];
                if (ch === content.charAt(0) && this.peek(content.length) === content) {
                    result = {
                        content: content,
                        line: this.line,
                        col: this.col,
                        indent: this.indent,
                        pos: this.pos
                    };

                    // 读取标记所在字符。
                    while (this.pos < result.pos + content.length - 1)
                        this.read();

                    return result;
                }
            }
        }
    }

};