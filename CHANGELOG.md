# post-authority changelog

## 1.1.2

* Await completion of `kill` command when calling `ports.kill(...)`

## 1.1.1

* Update deps, fix broken build

## 1.1.0

* Add `blame` and `kill` functions ([#2](https://github.com/Rich-Harris/port-authority/issues/2))

## 1.0.5

* Clear existing timeout when retrying in `wait`

## 1.0.4

* Remove extraneous export ([#7](https://github.com/Rich-Harris/port-authority/pull/7))
* Increase timeout ([#5](https://github.com/Rich-Harris/port-authority/pull/6))

## 1.0.3

* Detect WSL and work around bugs ([#5](https://github.com/Rich-Harris/port-authority/pull/5))

## 1.0.2

* Remove zombie timeout

## 1.0.1

* Switch to CJS export for `pkg.main`, UMD makes no sense

## 1.0.0

* First release