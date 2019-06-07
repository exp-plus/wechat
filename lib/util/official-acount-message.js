'use strict';


const ejs = require('ejs');
const heredoc = require('heredoc');

const rawTemplate = heredoc(function() { /*
	<xml>
		<ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
		<FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
		<CreateTime><%= createTime%></CreateTime>
		<MsgType><![CDATA[<%= msgType %>]]></MsgType>
		<% if(msgType ==='text') { %>
			<Content><![CDATA[<%= content %>]]></Content>
		<% }else if(msgType ==='image'){ %>
			<Image>
				<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
			</Image>
		<% }else if(msgType ==='voice'){ %>
			<Voice>
				<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
			</Voice>
		<% } else if(msgType ==='video'){ %>
			<Video>
				<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
				<Title><![CDATA[<%= content.title %>]]></Title>
				<Description><![CDATA[<%= content.description %>]]></Description>
			</Video>
		<% } else if(msgType ==='music'){ %>
			<Music>
				<Title><![CDATA[<%= content.title %>]]></Title>
				<Description><![CDATA[<%= content.description %>]]></Description>
				<MusicUrl><![CDATA[<%= content.musicUrl %>]]></MusicUrl>
				<HQMusicUrl><![CDATA[<%= content.hqMusicUrl %>]]></HQMusicUrl>
				<ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
			</Music>
		<% } else if(msgType ==='news'){ %>
			<ArticleCount><%= content.length %></ArticleCount>
			<Articles>
				<% content.forEach(function(item){ %>
				<item>
					<Title><![CDATA[<%= item.title %>]]></Title>
					<Description><![CDATA[<%= item.description %>]]></Description>
					<PicUrl><![CDATA[<%= item.picUrl %>]]></PicUrl>
					<Url><![CDATA[<%= item.url %>]]></Url>
				</item>
				<% }) %>
			</Articles>
		<% } %>
	</xml>
*/ });

const template = ejs.compile(rawTemplate);


/**
 * 将解析得到的对象进行扁平化处理
 * @param {JSON} nestedMessageJSON  嵌套的消息 json
 * @return {JSON} 扁平化的 json 对象
 */
function formatMessage(nestedMessageJSON) {
  const message = {};
  if (typeof result === 'object') {
    const keys = Object.keys(nestedMessageJSON);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = nestedMessageJSON[key];
      if (!(item instanceof Array) || item.length === 0) continue;
      if (item.length === 1) {
        const val = item[0];
        if (typeof val === 'object') message[key] = formatMessage(val);
        else message[key] = (val || '').trim();
      } else {
        message[key] = [];
        for (let j = 0, k = item.length; j < k; j++) message[key].push(formatMessage(item[j]));
      }
    }
  }
  return message;
}

module.exports = {
  formatMessage,
  template,
};
