from pathlib import Path
Import("env")
source = Path(env.subst("$PROJECT_LIBDEPS_DIR/$PIOENV/TinyUSB/src"))
env.Append(CPPPATH=[str(source)])
env.BuildSources("$BUILD_DIR/tinyusb", str(source), src_filter=[
    "+<tusb.c>", "+<common/tusb_fifo.c>", "+<device/>",
    "+<class/cdc/cdc_device.c>", "+<portable/st/stm32_fsdev/dcd_stm32_fsdev.c>",
])
# Derive the pinned ST linker script without vendoring a duplicate SDK file.
original = Path(env.PioPlatform().get_package_dir("tool-ldscripts-ststm32")) / "stm32g0/STM32G0B1KBTX_FLASH.ld"
text = original.read_text().replace("LENGTH = 128K", "LENGTH = 126K")
needle = "  .bss :"
if needle not in text:
    raise RuntimeError("Pinned ST linker script layout changed")
text = text.replace(needle, "  .noinit (NOLOAD) : { . = ALIGN(4); *(.noinit*) . = ALIGN(4); } >RAM\n\n" + needle, 1)
linker = Path(env.subst("$BUILD_DIR/general_pd.ld"))
linker.parent.mkdir(parents=True, exist_ok=True)
linker.write_text(text)
env.Replace(LDSCRIPT_PATH=str(linker))
