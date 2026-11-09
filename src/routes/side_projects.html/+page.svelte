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
  <h3>Bayplan</h3>
  <p>
    A dashboard to monitor and manage your AWS ECS clusters, services and tasks, surfacing failed deployments and
    unhealthy tasks along with the estimated cost.
    <br>
    <a href="https://demo.bayplan.dev/" target="_blank"><strong>Try the live demo &rarr;</strong></a>
  </p>
  <img class="img-zoomable theme-light" src="static/images/bayplan-light.png" alt="Bayplan screenshot" />
  <img class="img-zoomable theme-dark" src="static/images/bayplan-dark.png" alt="Bayplan screenshot" />
  <h3>pipescan</h3>
  <p>
    A tool that gives you insights into your CI/CD pipelines, covering reliability, performance, usage and deployments.
    <br>
    <a href="https://pipescan.shipit.dev/demo" target="_blank"><strong>Try the live demo &rarr;</strong></a>
  </p>
  <img class="img-zoomable theme-light" src="static/images/pipescan-light.png" alt="pipescan screenshot" />
  <img class="img-zoomable theme-dark" src="static/images/pipescan-dark.png" alt="pipescan screenshot" />
  <h3>SlashMetrics</h3>
  <p>
    A tool that allows you to explore the metrics of any Prometheus exporter directly from your browser.
    <br>
    <a href="https://slashmetrics.shipit.dev/" target="_blank"><strong>Try it live &rarr;</strong></a>
  </p>
  <img class="img-zoomable" src="static/images/slashmetrics.png" alt="SlashMetrics screenshot" />
  <h3>aws-quota-checker</h3>
  <p>
    A CLI tool that compares your AWS account's quota limits with the current number of resources to be able to request
    increases before running into a limit.
    <br>
    <a href="https://github.com/brennerm/aws-quota-checker" target="_blank"><strong>View on GitHub &rarr;</strong></a>
    <br>
    <img class="img-zoomable"
      src="https://raw.githubusercontent.com/brennerm/aws-quota-checker/master/img/example.png" alt="aws-quota-checker example output" />
  </p>
  <h3>uptimerobot-operator</h3>
  <p>
    A Kubernetes operator that takes care of creating <a href="https://uptimerobot.com/" target="_blank">UptimeRobot</a>
    monitors for your Ingresses and setting up public status pages, maintenance windows and alert contacts.
    <br>
    <a href="https://github.com/brennerm/uptimerobot-operator" target="_blank"><strong>View on GitHub &rarr;</strong></a>
  </p>
  <h3>PyTricks</h3>
  <p>
    A collection of less popular features and tricks for the Python programming language.
    <br>
    <a href="https://github.com/brennerm/PyTricks" target="_blank"><strong>View on GitHub &rarr;</strong></a>
  </p>
  <h3>check-mk-web-api</h3>
  <p>
    A Python library to interact with the API of the <a href="https://checkmk.com/" target="_blank">CheckMk monitoring
      solution</a>.
    <br>
    <a href="https://github.com/brennerm/check-mk-web-api" target="_blank"><strong>View on GitHub &rarr;</strong></a>
  </p>
  <h3>pi-power-calc</h3>
  <p>
    A web application that provides various calculators regarding the power consumption of all Raspberry Pi models.
    <br>
    <a href="https://pi-power-calc.shipit.dev/" target="_blank"><strong>Try it live &rarr;</strong></a>
    <br>
    <img class="img-zoomable" src="https://raw.githubusercontent.com/brennerm/pi-power-calc/master/screen.png" alt="pi-power-calc screenshot" />
  </p>
</section>
