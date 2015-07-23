
/**
 * ����Դ�벢�������б���б�
 */
function parseDoc(content) {
    var reader = new SourceReader(content);
    var docComments = getAllDocComments(reader);
    return docComments;
}

/**
 * ��ȡԴ���������ĵ�ע�͡�
 */
function getAllDocComments(reader) {

    var docComments = [],
        docComment,
        lastPos,
        token = reader.readTo("///", "/**");

    // ��ȡ����ע��ԭʼ��Ϣ��
    while (token) {

        if (token.content === "///") {
            reader.readTo("\n");
            hasSingleLineComments = true;
        } else {
            reader.readTo("*/");
        }

        // ���浱ǰ�ĵ�ע�����ݡ�
        docComment = {
            type: token.content,
            line: token.line,
            col: token.col,
            indent: token.indent,
            content: reader.source.substring(token.pos, lastPos = reader.pos)
        };

        // ���ȡ 2 ���ı����Ա�֮����ȡ��Ϣ��
        while (token = reader.readTo("///", "/**", "\n")) {

            // ������� /// �ϲ�Ϊһ��ע�͡�
            if (token.content === "///" && docComment.type === "///") {
                reader.readTo("\n");
                docComment.content += "\n" + reader.source.substring(token.pos, lastPos = reader.pos);
                continue;
            }

            // ������ȡһ�С�
            if (token.content === "\n") {
                token = reader.readTo("///", "/**", "\n");
            }
            break;
        }

        // ������ǰ���С�
        if (token && token.content === "\n") {
            token = reader.readTo("///", "/**");
        }

        // ����ʣ�ಿ�֡�
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
 * ��ʾһ��Դ���ȡ����
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
     * ��ȡ��һ���ַ���
     */
    read: function () {
        var ch = this.source.charAt(++this.pos);

        // ������� \r �� \n
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
     * Ԥ���������ַ���
     */
    peek: function (peekCount) {
        return this.source.substr(this.pos, peekCount || 1);
    },

    /**
     * ��ȡ�ı�ֱ������ָ���ַ���
     * @returns {Object} ���ؽ������
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

                    // ��ȡ��������ַ���
                    while (this.pos < result.pos + content.length - 1)
                        this.read();

                    return result;
                }
            }
        }
    }

};