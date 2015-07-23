
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

    while (token) {

        if (token.content === "///") {
            reader.readTo("\n");
            docComment = {
                type: token.content,
                line: token.line,
                col: token.col,
                indent: token.indent,
                content: reader.source.substring(token.pos, reader.pos)
            };

            // 读取剩下的同行 /// 。
            token = reader.readTo("///");

            if (docComment && docComment.type === "///" && docComment.line + 1 == token.line) {
                docComment.content += reader.source.substring(token.pos, reader.pos)
            } else {
                
            }
        } else {
            reader.readTo("*/");
            docComment = {
                type: token.content,
                line: token.line,
                col: token.col,
                indent: token.indent,
                content: reader.source.substring(token.pos, reader.pos)
            };
        }

        // 处理紧跟的代码文本以方便提取信息。
        lastPos = reader.pos;
        token = reader.readTo("///", "/**", "\n");
        docComment.rest = reader.source.substring(lastPos, (token || reader).pos);
        docComments.push(docComment);

        if (token && (token.content !== "///" && token.content !== "/**")) {
            token = reader.readTo("///", "/**");
        }

    }

    for (var i = 0; i < docComments.length; i++) {
        docComments[i].contentParsed = docComment.content.substring("/**".length, docComment.content.length - "*/".length).replace(/^\s*\*\s*/mg, "").trim();
        docComments[i].tags = parseDocComment(docComments[i].contentParsed);
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
                    while (this.pos < result.pos + content.length)
                        this.read();

                    return result;
                }
            }
        }
    }

};