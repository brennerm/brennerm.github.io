<script>
	import Seo from '#lib/components/Seo.svelte';
</script>

<Seo title="Projects" path="/side_projects" />

<section class="content">
  <h1>Projects</h1>
  <p>
    In my spare time I like to work on projects to solve problems I'm not able to find a solution for or simply out of
    educational purposes. Here's a partial list of what I've been building:
  </p>
  <!-- <h3 style="text-decoration: underline;">
    <a href="https://wheretohostmy.app/" target="_blank">Where to host my app?</a>
  </h3>
  <p>
    A search tool to find the best hosting provider for your app based on the technologies you use.
  </p>
  <img class="img-zoomable" src="static/images/wheretohostmy.app.png" /> -->
  <h3 style="text-decoration: underline;">
    <a href="https://slashmetrics.shipit.dev/" target="_blank">SlashMetrics</a>
  </h3>
  <p>
    A tool that allows you to explore the metrics of any Prometheus exporter directly from your browser.
  </p>
  <img class="img-zoomable" src="static/images/slashmetrics.png" alt="SlashMetrics screenshot" />
  <h3 style="text-decoration: underline;">
    <a href="https://github.com/brennerm/aws-quota-checker" target="_blank">aws-quota-checker</a>
  </h3>
  <p>
    A CLI tool that compares your AWS account's quota limits with the current number of resources to be able to request
    increases before running into a limit.
    <br>
    <img class="img-zoomable"
      src="https://raw.githubusercontent.com/brennerm/aws-quota-checker/master/img/example.png" alt="aws-quota-checker example output" />
  </p>
  <h3 style="text-decoration: underline;">
    <a href="https://github.com/brennerm/uptimerobot-operator" target="_blank">uptimerobot-operator</a>
  </h3>
  <p>
    A Kubernetes operator that takes care of creating <a href="https://uptimerobot.com/" target="_blank">UptimeRobot</a>
    monitors for your Ingresses and setting up public status pages, maintenance windows and alert contacts.
  </p>
  <h3 style="text-decoration: underline;">
    <a href="https://github.com/brennerm/PyTricks" target="_blank">PyTricks</a>
  </h3>
  <p>
    A collection of less popular features and tricks for the Python programming language.
  </p>
  <h3 style="text-decoration: underline;">
    <a href="https://github.com/brennerm/check-mk-web-api" target="_blank">check-mk-web-api</a>
  </h3>
  <p>
    A Python library to interact with the API of the <a href="https://checkmk.com/" target="_blank">CheckMk monitoring
      solution</a>.
    <br>
  </p>
  <h3 style="text-decoration: underline;">
    <a href="https://pi-power-calc.shipit.dev/" target="_blank">pi-power-calc</a>
  </h3>
  <p>
    A web application that provides various calculators regarding the power consumption of all Raspberry Pi models.
    <br>
    <img class="img-zoomable" src="https://raw.githubusercontent.com/brennerm/pi-power-calc/master/screen.png" alt="pi-power-calc screenshot" />
  </p>
</section>
