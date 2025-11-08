{
  description = "jake website";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";

    # Used for shell.nix
    flake-compat = {
      url = github:edolstra/flake-compat;
      flake = false;
    };
  };

  outputs = { self, nixpkgs, utils, ... } @ inputs:
    utils.lib.eachDefaultSystem (system:
      let
        inherit (lib) attrValues;
        pkgs = import nixpkgs { inherit system; };
        lib = pkgs.lib;

        site = pkgs.writeScriptBin "site" ''
          #!${pkgs.stdenv.shell}
          ${pkgs.bun}/bin/bun run main -- $@
        '';

        dev = pkgs.writeScriptBin "dev" ''
          #!${pkgs.stdenv.shell}
          ${pkgs.bun}/bin/bun run dev -- $@
        '';

      in rec {
        devShell = with pkgs; mkShell {
          name = "site";
          buildInputs = [
            bun
            # inotify-tools

            site
            dev
          ];

          LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath(with pkgs; [openssl sqlite])}:LD_LIBRARY_PATH";
        };
      });
}
