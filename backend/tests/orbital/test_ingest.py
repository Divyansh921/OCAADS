"""TLE transport and library parsing tests; not a test of orbital accuracy."""

from pathlib import Path

import pytest

from app.orbital.ingest import TleParseError, parse_tle_file, parse_tle_text

FIXTURE = (
    Path(__file__).resolve().parents[3]
    / "data" / "fixtures" / "orbital-validation" / "stations.tle"
)


def test_selected_snapshot_contains_one_target_and_five_comparisons():
    records = parse_tle_file(FIXTURE)

    assert set(records) == {
        "norad:25544",
        "norad:49271",
        "norad:66052",
        "norad:66906",
        "norad:67683",
        "norad:67685",
    }
    assert records["norad:25544"].display_name == "ISS (ZARYA)"
    assert records["norad:25544"].epoch.tzinfo is not None
    assert records["norad:25544"].as_contract_object().elements.format == "tle"


@pytest.mark.parametrize(
    "text",
    [
        "",
        "ISS\n1 not-a-tle\n2 not-a-tle\n",
        "ISS\n1 25544U 98067A   26276.49792087  .00005083  00000+0  10128-3 0  9999\n",
        "ISS\n2 wrong-line\n1 wrong-order\n",
    ],
)
def test_malformed_tle_input_fails_clearly(text):
    with pytest.raises(TleParseError):
        parse_tle_text(text)


def test_duplicate_catalog_ids_are_rejected():
    record = (
        "ISS\n1 25544U 98067A   26276.49792087  .00005083  00000+0  10128-3 0  9999\n"
        "2 25544  51.6313 124.0722 0006914 218.1010 141.9490 15.48725660588544\n"
    )
    with pytest.raises(TleParseError, match="duplicate"):
        parse_tle_text(record + record)
