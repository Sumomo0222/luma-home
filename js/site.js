/* 站点配置：构建时内嵌在页面里（<script type="application/json" id="site-data">）。 */
export const site = JSON.parse(document.getElementById('site-data').textContent);
