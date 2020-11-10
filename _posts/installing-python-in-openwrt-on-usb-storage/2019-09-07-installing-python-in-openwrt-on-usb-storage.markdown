---
layout: post
title: Installing Python in OpenWRT on a USB storage
description: A guide on installing Python on a USB storage device when running OpenWRT.
category: posts
tags: openwrt python
draft: false
---
## 1. The problem

Lately I was in need to periodically execute a Python script. To achieve this task my router, a [TP-Link N600](https://www.tp-link.com/us/products/details/cat-9_TL-WDR3600.html), running [OpenWRT](https://openwrt.org/) Chaos Calmer came to my mind as it's running the whole day anyway. So I checked the available packages in opkg, OpenWRT's package manager, and found what I was looking for. Confidently executing `opkg install python3` (for Python 2 it's `opkg install python`) resulted in the following
```
Collected errors:
 * wfopen: /usr/lib/python2.7/encodings/mac_latin2.py: No space left on device.
 * wfopen: /usr/lib/python2.7/encodings/iso8859_3.py: No space left on device.
 * wfopen: /usr/lib/python2.7/encodings/iso8859_1.py: No space left on device.
 * wfopen: /usr/lib/python2.7/encodings/euc_kr.py: No space left on device.
 * wfopen: /usr/lib/python2.7/encodings/cp775.py: No space left on device.
 * pkg_write_filelist: Failed to open //usr/lib/opkg/info/python-codecs.list: No space left on device.
 * opkg_install_pkg: Failed to extract data files for python-codecs. Package debris may remain!
 * opkg_install_cmd: Cannot install package python.
 * opkg_conf_write_status_files: Can't open status file //usr/lib/opkg/status: No space left on device.
```
Well Shit! Being used to work with devices with loads of storage I didn't expect that. `df` told me that my router has an incredible amount of 4.5, in words **four dot five**, megabytes of storage!
```
root@OpenWrt:~# df -h
Filesystem                Size      Used Available Use% Mounted on
rootfs                    4.5M      4.4M    108.0K  98% /
/dev/root                 2.3M      2.3M         0 100% /rom
tmpfs                    61.5M      1.2M     60.4M   2% /tmp
/dev/mtdblock3            4.5M      4.4M    108.0K  98% /overlay
overlayfs:/overlay        4.5M      4.4M    108.0K  98% /
tmpfs                   512.0K         0    512.0K   0% /dev
```
And so the journey began.
## 2. Looking for solutions
After some investigation I found out that opkg supports custom installation paths for packages. The router's RAM, mounted at /tmp, is one of the predefined targets. It's advantage is that it provides a lot more storage (in my case 61.5Mb), but you may already have one concern. Right, as we're working on volatile memory all data will be lost upon reboot.

As this was no option in my case I had to look further. Another solution would have been to use some kind of network storage and mount it via NFS. In my current environment I don't have anything like that available to me so I went with the next obvious solution. Expanding my router's storage using an USB device.
## 3. Accessing a USB device
The support for USB devices is documented fairly good on the two pages about [basic USB support](https://wiki.openwrt.org/doc/howto/usb.essentials) and [USB storage](https://wiki.openwrt.org/doc/howto/usb.storage). All I needed to do is to check the output of `dmesg` after plugging in my USB stick.
```
[5952821.750000] usb 1-1.1: new high-speed USB device number 3 using ehci-platform
```

In my case I had to install the driver for the ehci platform (USB 2.0).
```
opkg update
opkg install kmod-usb2 kmod-usb-storage
insmod ehci-hcd
```
Afterwards the system detected the device and made it available at _/dev/sda_.

Depending on the partitioning of your device you may need to install support for further filesystems like ext4.
```
opkg install kmod-fs-ext4
```
Now I was able to mount my USB stick.
```
mount -t ext4 /dev/sda1 /mnt/usb
```
As the mounting should happen automatically after every reboot installing the `block-mount` package, persisting the current mounts `block detect > /etc/config/fstab` and enabling the autostart `/etc/init.d/fstab enable` was necessary. All that was left was to enable the automount for the USB device by editing the file _/etc/config/fstab_.
## 4. Installing Python to a USB device
With a working USB storage I needed to tell opkg to actually use it. This was done by adding the following the file _/etc/opkg.conf_.
```
dest usb /mnt/usb
```
Installing packages to a non-default location may break. Some of the issues can be resolved by adjusting the path variables in _/etc/profile_.
```
export PATH=$PATH:/mnt/usb/bin:/mnt/usb/sbin:/mnt/usb/usr/bin:/mnt/usb/usr/sbin
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/mnt/usb/lib:/mnt/usb/usr/lib
```
Afterwards I was able to install Python using `opkg intall python3 -d usb`.
The OpenWrt docs suggest to precompile all Python modules to achieve a faster execution. `python -m compileall`

Et voila, we have a running Python interpreter!
```python
[GCC 4.8.3] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import this
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!
```
---
